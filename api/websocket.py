from gevent import monkey
monkey.patch_all()

import time
import json, re
from threading import Thread
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, join_room, leave_room
from msc_apps import *
import config

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = config.WEBSOCKET_SECRET
socketio = SocketIO(app)
thread = None
balance = None
clients = 0
maxclients = 0
maxaddresses = 0
addresses = {}

def printmsg(msg):
    print msg
    sys.stdout.flush()

def get_balancedata(address):
    addr = re.sub(r'\W+', '', address) #check alphanumeric
    #ROWS=dbSelect("select ab.propertyid,sp.propertytype,ab.balanceavailable,ab.balancepending from addressbalances ab, smartproperties sp "
    #              "where ab.address=%s and ab.propertyid=sp.propertyid and sp.protocol='Mastercoin'", [addr])
    ROWS=dbSelect("""select
                       f1.propertyid, sp.propertytype, f1.balanceavailable, f1.pendingpos, f1.pendingneg
                     from
                       (select
                          COALESCE(s1.propertyid,s2.propertyid) as propertyid, COALESCE(s1.balanceavailable,0) as balanceavailable,
                          COALESCE(s2.pendingpos,0) as pendingpos,COALESCE(s2.pendingneg,0) as pendingneg
                        from
                          (select propertyid,balanceavailable
                           from addressbalances
                           where address=%s) s1
                        full join
                          (SELECT atx.propertyid,
                             sum(CASE WHEN atx.balanceavailablecreditdebit > 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingpos,
                             sum(CASE WHEN atx.balanceavailablecreditdebit < 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingneg
                           from
                             addressesintxs atx, transactions tx
                           where
                             atx.txdbserialnum=tx.txdbserialnum
                             and tx.txstate='pending'
                             and tx.txdbserialnum<-1
                             and atx.address=%s
                           group by
                             atx.propertyid) s2
                        on s1.propertyid=s2.propertyid) f1
                     inner join smartproperties sp
                     on f1.propertyid=sp.propertyid and sp.protocol='Mastercoin'
                     order by f1.propertyid""",(addr,addr))

    balance_data = { 'balance': [] }
    for balrow in ROWS:
        cID = str(int(balrow[0])) #currency id
        sym_t = ('BTC' if cID == '0' else ('MSC' if cID == '1' else ('TMSC' if cID == '2' else 'SP' + cID) ) ) #symbol template
        #1 = new indivisible property, 2=new divisible property (per spec)
        divi = True if int(balrow[1]) == 2 else False
        res = { 'symbol' : sym_t, 'divisible' : divi, 'id' : cID }
        res['pendingpos'] = ('%.8f' % float(balrow[3])).rstrip('0').rstrip('.')
        res['pendingneg'] = ('%.8f' % float(balrow[4])).rstrip('0').rstrip('.')
        if balrow[4] < 0:
          #update the 'available' balance immediately when the sender sent something. prevent double spend
          res['value'] = ('%.8f' % float( (balrow[2]+balrow[4]) )).rstrip('0').rstrip('.')
        else:
          res['value'] = ('%.8f' % float(balrow[2])).rstrip('0').rstrip('.')

        #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
        balance_data['balance'].append(res)

    # if 0 >= len(ROWS):
    #   return ( None, '{ "status": "NOT FOUND: ' + addr + '" }' )

    btc_balance = { 'symbol': 'BTC', 'divisible': True, 'id' : 0 }
    out, err = run_command(TIMEOUT+ 'sx balance -j ' + addr )
    if err != None or out == '':
      btc_balance[ 'value' ] = int(-555)
      btc_balance['pending'] = int(0)
    else:
      try:
        btc_balance['pending'] = int( json.loads( out )[0][ 'pending' ] ) - int( json.loads( out )[0][ 'paid' ])
        if btc_balance['pending'] < 0:
          #update the 'available' balance immediately when the sender sent something. prevent double spend
          btc_balance[ 'value' ] = int( json.loads( out )[0][ 'pending' ])
        else:
          btc_balance[ 'value' ] = int( json.loads( out )[0][ 'paid' ])
      except ValueError:
        btc_balance[ 'value' ] = int(-555)
        btc_balance['pending'] = int(0)

    balance_data['balance'].append(btc_balance)
    return balance_data


def balance_thread():
    """Send balance data for the connected clients."""
    global addresses, maxaddresses, clients, maxclients
    count = 0
    TIMEOUT='timeout -s 9 8 '
    while True:
        time.sleep(60)
        count += 1
        printmsg("Tracking "+str(len(addresses))+"/"+str(maxaddresses)+"(max) addresses, for "+str(clients)+"/"+str(maxclients)+"(max) clients, ran "+str(count)+" times")
        for address in addresses:
          balance_data=get_balancedata(address)
          socketio.emit('address:'+address,
                      balance_data,
                      namespace='/balance')


@socketio.on('connect', namespace='/balance')
def balance_connect():
    printmsg('Client connected')
    global balance, clients, maxclients
    session['addresses']=[]

    clients += 1
    if clients > maxclients:
      maxclients=clients

    if balance is None:
        balance = Thread(target=balance_thread)
        balance.start()


def endSession(session):
  try:
    global addresses
    for address in session['addresses']:
      if addresses[address] == 1:
        addresses.pop(address)
      else:
        addresses[address] -= 1
  except KeyError:
    #addresses not defined
    printmsg("No addresses list to clean for "+str(session))


@socketio.on('disconnect', namespace='/balance')
def disconnect():
    printmsg('Client disconnected')
    global clients
    clients -=1
    #make sure we don't screw up the counter if reloading mid connections
    if clients < 0:
      clients=0
    endSession(session)


@socketio.on('session:logout', namespace='/balance')
def logout():
    #printmsg('Client logged out')
    endSession(session)


@socketio.on("address:add", namespace='/balance')
def add_address(message):
  global addresses, maxaddresses
  
  address = message['data']
  if str(address) in addresses: 
    addresses[str(address)] += 1
  else:
    addresses[str(address)] = 1

  if str(address) not in session['addresses']:
    session['addresses'].append(str(address))

  if len(addresses) > maxaddresses:
    maxaddresses=len(addresses)

  #speed up initial data load
  balance_data=get_balancedata(address)
  emit('address:'+address,
        balance_data,
        namespace='/balance')

@socketio.on("address:refresh", namespace='/balance')
def refresh_address(message):
  global addresses

  address = message['data']
  if str(address) in addresses:
    balance_data=get_balancedata(address)
    emit('address:'+address,
        balance_data,
        namespace='/balance')
  else:
    add_address(message)

if __name__ == '__main__':
  socketio.run(app, '127.0.0.1',1091)

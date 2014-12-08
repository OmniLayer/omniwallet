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
addresses = {}

def printmsg(msg):
    print msg
    sys.stdout.flush()

def get_balancedata(address):
    addr = re.sub(r'\W+', '', address) #check alphanumeric
    ROWS=dbSelect("select * from addressbalances ab, smartproperties sp where ab.address=%s and ab.propertyid=sp.propertyid "
                  "and sp.protocol='Mastercoin'", [addr])

    balance_data = { 'balance': [] }
    for balrow in ROWS:
        cID = str(int(balrow[2])) #currency id
        sym_t = ('BTC' if cID == '0' else ('MSC' if cID == '1' else ('TMSC' if cID == '2' else 'SP' + cID) ) ) #symbol template
        divi = balrow[-1]['divisible'] if type(balrow[-1]) == type({}) else json.loads(balrow[-1])['divisible']  #Divisibility
        res = { 'symbol' : sym_t, 'divisible' : divi, 'id' : cID }
        res['value'] = ('%.8f' % float(balrow[4])).rstrip('0').rstrip('.')
        #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
        balance_data['balance'].append(res)

    # if 0 >= len(ROWS):
    #   return ( None, '{ "status": "NOT FOUND: ' + addr + '" }' )

    btc_balance = { 'symbol': 'BTC', 'divisible': True, 'id' : 0 }
    out, err = run_command(TIMEOUT+ 'sx balance -j ' + addr )
    if err != None or out == '':
      btc_balance[ 'value' ] = int(-666)
    else:
      try:
        btc_balance[ 'value' ] = int( json.loads( out )[0][ 'paid' ])
      except ValueError:
        btc_balance[ 'value' ] = int(-666)

    balance_data['balance'].append(btc_balance)
    return balance_data


def balance_thread():
    """Send balance data for the connected clients."""
    global addresses
    count = 0
    TIMEOUT='timeout -s 9 8 '
    while True:
        time.sleep(10)
        count += 1
        printmsg("Tracking "+str(len(addresses))+" addresses, ran "+str(count)+" times")
        for address in addresses:
          balance_data=get_balancedata(address)
          socketio.emit('address:'+address,
                      balance_data,
                      namespace='/balance')


@socketio.on('connect', namespace='/balance')
def balance_connect():
    #printmsg('Client connected')
    session['addresses']=[]
    global balance
    if balance is None:
        balance = Thread(target=balance_thread)
        balance.start()


def endSession(session):
    global addresses
    for address in session['addresses']:
      if addresses[address] == 1:
        addresses.pop(address)
      else:
        addresses[address] -= 1


@socketio.on('disconnect', namespace='/balance')
def disconnect():
    #printmsg('Client disconnected')
    endSession(session)


@socketio.on('session:logout', namespace='/balance')
def logout():
    #printmsg('Client logged out')
    endSession(session)


@socketio.on("address:add", namespace='/balance')
def add_address(message):
  global addresses
  address = message['data']
  if str(address) in addresses: 
    addresses[str(address)] += 1
  else:
    addresses[str(address)] = 1

  if str(address) not in session['addresses']:
    session['addresses'].append(str(address))

  #speed up initial data load
  balance_data=get_balancedata(address)
  emit('address:'+address,
        balance_data,
        namespace='/balance')


if __name__ == '__main__':
  socketio.run(app, '127.0.0.1',1091)

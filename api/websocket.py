from gevent import monkey
monkey.patch_all()

import time, datetime
import json, re
from threading import Thread
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, join_room, leave_room
from msc_apps import *
from balancehelper import *
from omnidex import getOrderbook
from values_service import getValueBook
from cacher import *
import config

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = config.WEBSOCKET_SECRET
socketio = SocketIO(app)

#threads
watchdog = None
emitter = None
bthread = None
vthread = None
othread = None
#stat trackers
clients = 0
maxclients = 0
maxaddresses = 0
#data
addresses = {}
orderbook = {}
lasttrade = 0
lastpending = 0
valuebook = {}


def printmsg(msg):
    print str(datetime.datetime.now())+str(" ")+str(msg)
    sys.stdout.flush()

def update_balances():
  global addresses, balances
  try:
    while True:
      time.sleep(10)
      printmsg("updating balances")
      balances=rGet("omniwallet:balances:balbook"+str(config.REDIS_ADDRSPACE))
      if balances != None:
        printmsg("Balances loaded from redis")
        balances=json.loads(balances)
      else:
        printmsg("Could not load balances from redis, falling back")
        balances=get_bulkbalancedata(addresses)

      for addr in list(addresses):
        if addresses[addr] < 1 and addresses[addr] >= -30:
          addresses[addr] -= 1
          #cache old addresses for 5~10 minutes after user discconects
        elif addresses[addr] < -30:
          addresses.pop(addr)
      rSet("omniwallet:balances:addresses"+str(config.REDIS_ADDRSPACE),json.dumps(addresses))
  except Exception as e:
    printmsg("error updating balances: "+str(e))

def update_orderbook():
  global orderbook, lasttrade, lastpending
  try:
    while True:
      time.sleep(10)
      printmsg("updating orderbook")
      book=rGet("omniwallet:omnidex:book")
      if book != None:
        lasttrade = rGet("omniwallet:omnidex:lasttrade")
        lastpending = rGet("omniwallet:omnidex:lastpending")
        printmsg("Loading orderbook from redis.")
        orderbook=json.loads(book)
        printmsg("Orderbook Lasttrade: "+str(lasttrade)+" Book length is: "+str(len(orderbook)))
      else:
        ret=getOrderbook(lasttrade, lastpending)
        printmsg("Checking for new orderbook updates, last: "+str(lasttrade))
        if ret['updated']:
          orderbook=ret['book']
          printmsg("Orderbook updated. Lasttrade: "+str(lasttrade)+" Newtrade: "+str(ret['lasttrade'])+" Book length is: "+str(len(orderbook)))
          lasttrade=ret['lasttrade']
          lastpending=ret['lastpending']
  except Exception as e:
    printmsg("error updating orderbook: "+str(e))

def update_valuebook():
  global valuebook
  try:
    while True:
      time.sleep(10)
      printmsg("updating valuebook")
      vbook=getValueBook()
      if len(vbook)>0:
        for v in vbook:
          name=v[0]
          p1=v[1]
          pid1=int(v[2])
          p2=v[3]
          pid2=int(v[4])
          rate=v[5]
          tstamp=str(v[6])
          source=v[7]
          if p1=='Bitcoin' and p2=='Omni':
            if pid2==1:
              symbol="OMNI"
            else:
              symbol="SP"+str(pid2)
          elif p1=='Fiat' and p2=='Bitcoin':
            symbol="BTC"
            if pid1>0 or pid2>0:
              symbol=symbol+str(name)
          else:
            symbol=name+str(pid2)
          valuebook[symbol]={"price":rate,"symbol":symbol,"timestamp":tstamp, "source":source}
  except Exception as e:
    printmsg("error updating valuebook: "+str(e))

def watchdog_thread():
    global emitter, bthread, vthread, othread
    while True:
      try:
        time.sleep(10)
        printmsg("watchdog running")
        if emitter is None or not emitter.isAlive():
          printmsg("emitter not running")
          emitter = Thread(target=emitter_thread)
          emitter.start()
        if bthread is None or not bthread.isAlive():
          printmsg("balance thread not running")
          bthread = Thread(target=update_balances)
          bthread.start()
        if vthread is None or not vthread.isAlive():
          printmsg("value thread not running")
          vthread = Thread(target=update_valuebook)
          vthread.start()
        if othread is None or not othread.isAlive():
          printmsg("orderbook not running")
          othread = Thread(target=update_orderbook)
          othread.start()
      except Exception as e:
        printmsg("error in watchdog: "+str(e))

def emitter_thread():
    #Send data for the connected clients
    global addresses, maxaddresses, clients, maxclients, book, balances, valuebook
    count = 0
    while True:
      try:
        time.sleep(15)
        count += 1
        printmsg("Tracking "+str(len(addresses))+"/"+str(maxaddresses)+"(max) addresses, for "+str(clients)+"/"+str(maxclients)+"(max) clients, ran "+str(count)+" times")
        #push addressbook
        socketio.emit('address:book',balances,namespace='/balance')
        #push valuebook
        socketio.emit('valuebook',valuebook,namespace='/balance')
        #push orderbook
        socketio.emit('orderbook',orderbook,namespace='/balance')
      except Exception as e:
        printmsg("emitter error: "+str(e))

@socketio.on('connect', namespace='/balance')
def balance_connect():
    printmsg('Client connected')
    global watchdog, clients, maxclients
    session['addresses']=[]

    clients += 1
    if clients > maxclients:
      maxclients=clients

    if watchdog is None or not watchdog.isAlive():
        watchdog = Thread(target=watchdog_thread)
        watchdog.start()


def endSession(session):
  try:
    global addresses
    for address in session['addresses']:
      if addresses[address] == 1:
        #addresses.pop(address)
         addresses[address] = -1
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
  if str(address) not in session['addresses']:
    session['addresses'].append(str(address))
    if str(address) in addresses and addresses[str(address)] > 0:
      addresses[str(address)] += 1
    else:
      addresses[str(address)] = 1
      rSet("omniwallet:balances:addresses"+str(config.REDIS_ADDRSPACE),json.dumps(addresses))
      #speed up initial data load
      balance_data=get_balancedata(address)
      emit('address:'+address,
        balance_data,
        namespace='/balance')

  if len(addresses) > maxaddresses:
    maxaddresses=len(addresses)


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

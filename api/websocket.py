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
import config

app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = config.WEBSOCKET_SECRET
socketio = SocketIO(app)
#threads
watchdog = None
emitter = None
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
    printmsg("updating balances")
    global addresses, balances
    balances=get_bulkbalancedata(addresses)

def update_orderbook():
    printmsg("updating orderbook")
    global orderbook, lasttrade, lastpending
    ret=getOrderbook(lasttrade, lastpending)
    printmsg("Checking for new orderbook updates, last: "+str(lasttrade))
    if ret['updated']:
      orderbook=ret['book']
      printmsg("Orderbook updated. Lasttrade: "+str(lasttrade)+" Newtrade: "+str(ret['lasttrade'])+" Book length is: "+str(len(orderbook)))
      lasttrade=ret['lasttrade']
      lastpending=ret['lastpending']

def update_valuebook():
    printmsg("updating valuebook")
    global valuebook
    vbook=getValueBook()
    if len(vbook)>0:
      for v in vbook:
        name=v[0]
        p1=v[1]
        pid1=int(v[2])
        p2=v[3]
        pid2=int(v[4])
        rate=v[5]
        time=str(v[6])
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
        valuebook[symbol]={"price":rate,"symbol":symbol,"timestamp":time, "source":source}

def watchdog_thread():
    global emitter
    while True:
      time.sleep(10)
      printmsg("watchdog running")
      update_orderbook()
      update_balances()
      update_valuebook()
      if emitter is None or not emitter.isAlive():
          printmsg("emitter not running")
          emitter = Thread(target=emitter_thread)
          emitter.start()

def emitter_thread():
    #Send data for the connected clients
    global addresses, maxaddresses, clients, maxclients, book, balances, valuebook
    count = 0
    while True:
        time.sleep(15)
        count += 1
        printmsg("Tracking "+str(len(addresses))+"/"+str(maxaddresses)+"(max) addresses, for "+str(clients)+"/"+str(maxclients)+"(max) clients, ran "+str(count)+" times")
        #push orderbook
        socketio.emit('orderbook',orderbook,namespace='/balance')
        #push valuebook
        socketio.emit('valuebook',valuebook,namespace='/balance')
        #push addressbook
        socketio.emit('address:book',balances,namespace='/balance')

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
  if str(address) not in session['addresses']:
    session['addresses'].append(str(address))
    if str(address) in addresses: 
      addresses[str(address)] += 1
    else:
      addresses[str(address)] = 1

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

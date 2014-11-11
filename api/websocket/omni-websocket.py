from gevent import monkey
monkey.patch_all()

import time
from threading import Thread
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, join_room, leave_room
from msc_apps import *
app = Flask(__name__)
app.debug = True
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
thread = None
balance = None
addresses = []

def background_thread():
    """Example of how to send server generated events to clients."""
    count = 0
    while True:
        time.sleep(10)
        count += 1
        socketio.emit('my response',
                      {'data': 'Server generated event', 'count': count},
                      namespace='/test')

def balance_thread():
  global addresses
  TIMEOUT='timeout -s 9 60 '
  # Get the Mastercoin balances.  Not that this is also creating the default balance
  # object, and should run before all the other currency checks.
  def get_msc_balances( addr ):
    #TODO move functionality for individual currencies into /tx/ endpoint (sent, received, total reserved balances, etc.)
    addr = re.sub(r'\W+', '', addr) #check alphanumeric
    ROWS=dbSelect("select * from addressbalances ab, smartproperties sp where ab.address=%s and ab.propertyid=sp.propertyid "
                  "and sp.protocol='Mastercoin'", [addr])

    address_data = { 'address' : addr, 'balance': [] }
    for balrow in ROWS:
        cID = str(int(balrow[2])) #currency id
        sym_t = ('BTC' if cID == '0' else ('MSC' if cID == '1' else ('TMSC' if cID == '2' else 'SP' + cID) ) ) #symbol template
        divi = balrow[-1]['divisible'] if type(balrow[-1]) == type({}) else json.loads(balrow[-1])['divisible']  #Divisibility
        res = { 'symbol' : sym_t, 'divisible' : divi  }
        res['value'] = ('%.8f' % float(balrow[4])).rstrip('0').rstrip('.')
        #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
        address_data['balance'].append(res)

    if 0 >= len(ROWS):
      return ( None, '{ "status": "NOT FOUND: ' + addr + '" }' )

    return ( address_data, None )

  # Get the Bitcoin balances - this is a different format from the MSC one above.
  def get_btc_balances( addr ):
    balances = { 'symbol': 'BTC', 'divisible': True }
    out, err = run_command(TIMEOUT+ 'sx balance -j ' + addr )
    if err != None:
      return None, err
    elif out == '':
      return None, 'No bitcoin balance available.  Invalid address?: ' + addr
    else:
      try:
          balances[ 'value' ] = int( json.loads( out )[0][ 'paid' ])
      except ValueError:
          balances[ 'value' ] = int(-666)

    return ( [ balances ], None )

  while True:
    for address in addresses:
      addr = re.sub(r'\W+', '', address) #check alphanumeric

      address_data, err = get_msc_balances( addr )
      if err != None:
        address_data = {}
        address_data[ 'address' ] = addr
        address_data[ 'balance' ] = []

      bitcoin_balances, err = get_btc_balances( addr )

      if err == None:
        for i in xrange(0,len( bitcoin_balances )):
          address_data[ 'balance' ].append( bitcoin_balances[i] )

      socketio.emit("update:"+address,
        address_data, namespace="/balance")

@app.route('/')
def index():
    global thread
    if thread is None:
        thread = Thread(target=background_thread)
        thread.start()
    return render_template('websocket.html')

@socketio.on('connect', namespace='/balance')
def balance_connect():
    global balance
    if balance is None:
        balance = Thread(target=balance_thread)
        balance.start()

@socketio.on("add address", namespace='/balance')
def add_address(message):
  global addresses
  addresses.push(message['data'])

@socketio.on('my event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': message['data'], 'count': session['receive_count']})


@socketio.on('my broadcast event', namespace='/test')
def test_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': message['data'], 'count': session['receive_count']},
         broadcast=True)


@socketio.on('join', namespace='/test')
def join(message):
    join_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': 'In rooms: ' + ', '.join(request.namespace.rooms),
          'count': session['receive_count']})


@socketio.on('leave', namespace='/test')
def leave(message):
    leave_room(message['room'])
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': 'In rooms: ' + ', '.join(request.namespace.rooms),
          'count': session['receive_count']})


@socketio.on('my room event', namespace='/test')
def send_room_message(message):
    session['receive_count'] = session.get('receive_count', 0) + 1
    emit('my response',
         {'data': message['data'], 'count': session['receive_count']},
         room=message['room'])


@socketio.on('connect', namespace='/test')
def test_connect():
    emit('my response', {'data': 'Connected', 'count': 0})


@socketio.on('disconnect', namespace='/test')
def test_disconnect():
    print('Client disconnected')


if __name__ == '__main__':
    socketio.run(app, '127.0.0.1',1091)
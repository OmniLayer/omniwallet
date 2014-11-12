from gevent import monkey
monkey.patch_all()

# import os, sys
import time
from threading import Thread
from flask import Flask, render_template, session, request
from flask.ext.socketio import SocketIO, emit, join_room, leave_room
# sys.path.append(os.path.abspath(".."))
# from msc_apps import *
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
                      {'data': 'Server generated event from /test', 'count': count},
                      namespace='/test')

def balance_thread():
    """Send balance data for the connected clients."""
    global addresses
    count = 0
    while True:
        time.sleep(10)
        count += 1
        socketio.emit('my response',
                      {'data': addresses, 'count': count},
                      namespace='/balance')
  # global addresses
  # TIMEOUT='timeout -s 9 60 '
  # # Get the Mastercoin balances.  Not that this is also creating the default balance
  # # object, and should run before all the other currency checks.
  # def get_msc_balances( addr ):
  #   #TODO move functionality for individual currencies into /tx/ endpoint (sent, received, total reserved balances, etc.)
  #   addr = re.sub(r'\W+', '', addr) #check alphanumeric
  #   ROWS=dbSelect("select * from addressbalances ab, smartproperties sp where ab.address=%s and ab.propertyid=sp.propertyid "
  #                 "and sp.protocol='Mastercoin'", [addr])

  #   address_data = { 'address' : addr, 'balance': [] }
  #   for balrow in ROWS:
  #       cID = str(int(balrow[2])) #currency id
  #       sym_t = ('BTC' if cID == '0' else ('MSC' if cID == '1' else ('TMSC' if cID == '2' else 'SP' + cID) ) ) #symbol template
  #       divi = balrow[-1]['divisible'] if type(balrow[-1]) == type({}) else json.loads(balrow[-1])['divisible']  #Divisibility
  #       res = { 'symbol' : sym_t, 'divisible' : divi  }
  #       res['value'] = ('%.8f' % float(balrow[4])).rstrip('0').rstrip('.')
  #       #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
  #       address_data['balance'].append(res)

  #   if 0 >= len(ROWS):
  #     return ( None, '{ "status": "NOT FOUND: ' + addr + '" }' )

  #   return ( address_data, None )

  # # Get the Bitcoin balances - this is a different format from the MSC one above.
  # def get_btc_balances( addr ):
  #   balances = { 'symbol': 'BTC', 'divisible': True }
  #   out, err = run_command(TIMEOUT+ 'sx balance -j ' + addr )
  #   if err != None:
  #     return None, err
  #   elif out == '':
  #     return None, 'No bitcoin balance available.  Invalid address?: ' + addr
  #   else:
  #     try:
  #         balances[ 'value' ] = int( json.loads( out )[0][ 'paid' ])
  #     except ValueError:
  #         balances[ 'value' ] = int(-666)

  #   return ( [ balances ], None )

  # while True:
  #   for address in addresses:
  #     addr = re.sub(r'\W+', '', address) #check alphanumeric

  #     address_data, err = get_msc_balances( addr )
  #     if err != None:
  #       address_data = {}
  #       address_data[ 'address' ] = addr
  #       address_data[ 'balance' ] = []

  #     bitcoin_balances, err = get_btc_balances( addr )

  #     if err == None:
  #       for i in xrange(0,len( bitcoin_balances )):
  #         address_data[ 'balance' ].append( bitcoin_balances[i] )

  #     socketio.emit("update:"+address,
  #       address_data, namespace="/balance")

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

@socketio.on("address:add", namespace='/balance')
def add_address(message):
  global addresses
  addresses.push(message['data'])

@socketio.on("getunsigned:get", namespace='/transaction')
def get_unsigned(message):
    tx_type= message["tx_type"]
    #update this to support more transactions
    supported_transactions = [50,51, 0]

    if tx_type not in supported_transactions:
        emit("getunsigned:result",{ 'status': 400, 'data': 'Unsupported transaction type '+str(tx_type) },namespace="/transaction")
    
    expected_fields=['transaction_version', 'transaction_from','pubkey','fee']

    print "Form ",message["data"]

    #might add tx 00, 53, etc later;
    if tx_type == 50:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'number_properties']
    elif tx_type == 51:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'currency_identifier_desired', 'number_properties', 'deadline', 'earlybird_bonus', 'percentage_for_issuer']
    elif tx_type == 0:
        expected_fields+=['currency_identifier', 'amount_to_transfer', 'transaction_to']
    for field in expected_fields:
        if field not in message["data"]:
            emit("getunsigned:result",{ 'status': 403, 'data': 'No field in request form '+field },namespace="/transaction")
        elif message["data"][field] == '':
            emit("getunsigned:result",{ 'status': 403, 'data': 'Empty field in request form '+field },namespace="/transaction")

    if 'testnet' in message["data"] and ( message["data"]['testnet'] in ['true', 'True'] ):
        global testnet
        testnet =True
        global magicbyte
        magicbyte = 111
        global exodus_address
        exodus_address=testnet_exodus_address

    txdata = prepare_txdata(tx_type, message["data"])
    if tx_type == 50:
        try:
            tx50bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx50bytes[0], tx50bytes[1], message["data"]['transaction_from'] )
            unsignedhex = build_transaction( message["data"]['fee'], message["data"]['pubkey'], packets[0], packets[1], packets[2], message["data"]['transaction_from'])
            
            #DEBUG print tx50bytes, packets, unsignedhex
            emit("getunsigned:result",{ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] },namespace="/transaction")
        except Exception as e:
            emit("getunsigned:result",{ 'status': 502, 'data': 'Unspecified error '+str(e)}) 
    elif tx_type == 51:
        try:
            tx51bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx51bytes[0], tx51bytes[1], message["data"]['transaction_from'])
            unsignedhex= build_transaction( message["data"]['fee'], message["data"]['pubkey'], packets[0], packets[1], packets[2], message["data"]['transaction_from'])
            #DEBUG print tx51bytes, packets, unsignedhex
            emit("getunsigned:result",{ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] },namespace="/transaction")
        except Exception as e:
            emit("getunsigned:result",{ 'status': 502, 'data': 'Unspecified error '+str(e)}) 
            
    elif tx_type == 0:
        try:
            tx0bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx0bytes[0], tx0bytes[1], message["data"]['transaction_from'])
            unsignedhex= build_transaction( message["data"]['fee'], message["data"]['pubkey'], packets[0], packets[1], packets[2], message["data"]['transaction_from'], request.form['transaction_to'])
            #DEBUG print tx0bytes, packets, unsignedhex
            emit("getunsigned:result",{ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] },namespace="/transaction")
        except Exception as e:
            emit("getunsigned:result",{ 'status': 502, 'data': 'Unspecified error '+str(e)},namespace="/transaction" )
             

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
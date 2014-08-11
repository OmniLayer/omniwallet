import urlparse
import os, sys, re, random,pybitcointools, bitcoinrpc, math
from decimal import Decimal
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

#conn = bitcoinrpc.connect_to_local()
conn = getRPCconn()
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

testnet_exodus_address='mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv'
magicbyte=0
testnet=False

#This endpoint supports BTC sends (+ BTC sends to exodus) only
@app.route('/', methods=['POST'])
def generate_btcsend():
    expected_fields=['from_address', 'to_address', 'amount', 'currency', 'fee']

    for field in expected_fields:
        if field not in request.form:
            return jsonify({ 'status': 403, 'data': 'No field in request form '+field })
        elif request.form[field] == '':
            return jsonify({ 'status': 403, 'data': 'Empty field in request form '+field })

    if request.form['amount'] < 5757: #don't allow less than 0.00005757 for a send
        amount=5757
    else:
        amount=int(request.form['amount'])

    if request.form['fee'] < 10000 or request.form['fee'] > 500000: #don't allow more than 0.005BTC in fees
        fee=10000
    else:
        fee=int(request.form['fee'])

    #the only supported currency is BTC
    currency_id=0

    if 'testnet' in request.form and ( bool(int(request.form['testnet'])) == True):
        global testnet
        testnet =True
        global magicbyte
        magicbyte =111

    marker_addr=None
    try:
        marker=str(request.form['marker'])
        if marker.lower()=='true':
            if not testnet:
                marker_addr=exodus_address
            else:
                marked_addr=testnet_exodus_address
    except KeyError:
        # if no marker, marker_addr stays None
        pass
    
    #TODO sanitize
    from_addr=request.form['from_address']

    tx_to_sign_dict={'transaction':'','sourceScript':''}
    l=len(from_addr)
    if l == 66 or l == 130:
        
        try:
            pub_to_addr=pybitcointools.pubkey_to_address(from_addr,magicbyte)
            print 'got addr from pubkey' , pub_to_addr
            validateaddr=conn.validateaddress(pub_to_addr)
            print 'is valid ? ', validateaddr
            isvalidaddr=bool(validateaddr.isvalid)

            #validate to_addr too
            #TODO Sanitize
            conn.validateaddress(request.form['to_address'])
            to_addr=request.form['to_address']
        except Exception, e:
            isvalidaddr=False
        
        if isvalidaddr:
            pubkey=from_addr
            response_status='OK'
        else:
            return jsonify({ 'status': 403, 'data': 'Invalid pubkey' })
    else:
        return jsonify({ 'status': 403, 'data': 'Invalid length for pubkey' })

    response={"status": 403, "transaction":"transaction generation failed.", "sourceScript": "failed" }
    try:
        tx_to_sign_dict=prepTX( from_addr, to_addr, marker_addr, currency_id, amount, fee)
        
        response={"status": 200, "transaction":tx_to_sign_dict['transaction'], "sourceScript":tx_to_sign_dict['sourceScript']}
    except Exception as e:
        return jsonify({ 'status': 403, 'data': 'Error ' + str(e) })

    return jsonify(response)

# simple send and bitcoin send (with or without marker)
def prepTX(from_address, to_address, marker_address, currency_id, amount, btc_fee):

    print 'regular BTC send'
    print '    send tx for signing, amount: ' + str(amount)
    print '    btc_fee: ' + str(btc_fee)
    print '    from, to, marker?, cID: ', [from_address,to_address,marker_address,currency_id]

    from_address_pub=from_address
    from_address=pybitcointools.pubkey_to_address(from_address,magicbyte)

    # set change address to from address
    change_address_pub=from_address_pub
    changeAddress=from_address
  
    satoshi_amount=int( amount )
    fee=int( btc_fee )

    # differ bitcoin send and other currencies
    if currency_id == 0: # bitcoin
        # normal bitcoin send
        required_value=satoshi_amount
        # if marker is needed, allocate dust for the marker
        if marker_address != None:
            required_value+=1*dust_limit
 
    #clean sx output, initial version by achamely
    utxo_list = []
    #round so we aren't under fee amount
    dirty_txes = get_utxo( from_address, fee+amount ).replace(" ", "")


    if (dirty_txes[:3]=='Ass') or (dirty_txes[0][:3]=='Not'):
        raise Exception("Not enough funds, try again. Needed: " + str(fee+amount))

    for line in dirty_txes.splitlines():
        utxo_list.append(line.split(':'))

    z = 0
    total_amount=0
    unspent_tx = []
    for item in utxo_list:
        # unspent tx: [0] - txid; [1] - vout; [2] - amount;
        if utxo_list[z][0] == "output":
            unspent_tx.append( [ utxo_list[z][1] , utxo_list[z][2] ] )
        if utxo_list[z][0] == "value":
            unspent_tx[-1] += [ int( utxo_list[z][1] ) ]
            total_amount += int( utxo_list[z][1] )
        z += 1

    # calculate change : 
    # (total input amount) - (broadcast fee)
    change = total_amount - (fee+amount)
    
    validnextinputs = []   #get valid redeemable inputs
    for unspent in unspent_tx:
        #retrieve raw transaction to spend it
        prev_tx = conn.getrawtransaction(unspent[0])

        for output in prev_tx.vout:
            if output['scriptPubKey']['reqSigs'] == 1 and output['scriptPubKey']['type'] != 'multisig':
                for address in output['scriptPubKey']['addresses']:
                    if address == from_address and int(output['n']) == int(unspent[1]):
                        validnextinputs.append({ "txid": prev_tx.txid, "vout": output['n']})
                        break
    
    validnextoutputs={}
    if marker_address != None:
        validnextoutputs = { marker_address : 0.00005757 }
    
    validnextoutputs[to_address]=float(Decimal(amount)/Decimal(1e8)) #Add for simple send

    if change >= 5757: # send anything above dust to yourself otherwise it goes to mining fees
        validnextoutputs[ from_address ] = float( Decimal(change)/Decimal(1e8) )
    
    unsigned_raw_tx = conn.createrawtransaction(validnextinputs, validnextoutputs)
    
    print 'inputs_outputs are ', [validnextinputs,validnextoutputs]
    print 'unsigned tx is '+str(unsigned_raw_tx)

    hash160=bc_address_to_hash_160(from_address).encode('hex_codec')
    prevout_script='OP_DUP OP_HASH160 ' + hash160 + ' OP_EQUALVERIFY OP_CHECKSIG'

    # tx, inputs
    return_dict={'transaction':unsigned_raw_tx, 'sourceScript':prevout_script}
    return return_dict


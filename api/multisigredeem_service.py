import urlparse
import os, sys, re, random,pybitcointools, bitcoinrpc, math, commands, json
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

magicbyte=0
testnet=False

@app.route('/', methods=['POST'])
def redeem():
    try:
        from_address_pubkey = request.form['address']
        from_address_pubkey = re.sub(r'\W+', '', from_address_pubkey) #check alphanumeric
        if 'testnet' in request.form and bool(request.form['testnet']):
            global magicbyte
            magicbyte=111
            global testnet
            testnet=True
        from_address = pybitcointools.pubkey_to_address(from_address_pubkey,magicbyte)
        to_address = from_address
        fee = 0.0001
    except KeyError:
        abort(make_response('No field \'address\' in request, request failed', 400))
    
    if not conn.validateaddress(from_address).isvalid:
        return jsonify({ 'status': 403, 'data': 'Not a valid address' })

    #calculate minimum unspent balance
    available_balance = Decimal(0.0)

    addrhist = json.loads(get_json_history(from_address))
    #for tx in addrhist:
        #return jsonify({})

    unspent_tx = []
    error_tx = []
    processed_txes = []
    for transaction in addrhist:
        tx_txid = transaction['output'].split(':')[0]
        if tx_txid not in processed_txes:
            processed_txes.append(tx_txid)
            try:
                tx = conn.getrawtransaction(tx_txid)
                for output in tx.vout:
                    if output['scriptPubKey']['type']=='multisig' and from_address_pubkey in output['scriptPubKey']['asm'].split(' '):
                        if commands.getoutput('bitcoind gettxout ' +  str(tx_txid) + ' ' + str(output['n'])) != '':
                            unspent_tx.append([ { "txid": tx_txid, "vout": output['n']}, output['value'] ])
            except Exception,e:
                print e
                error_tx.append(tx_txid)
                #Transaction probably not found, don't worry
                pass

    validnextinputs = []
    total_val = float(0.0)
    for input_ in unspent_tx:
        validnextinputs.append(input_[0])
        total_val += float(input_[1])

    #print total_val
    unsigned_raw_tx = conn.createrawtransaction(validnextinputs, { to_address : float(total_val)-float(fee) } )
    
    hash160=bc_address_to_hash_160(from_address).encode('hex_codec')
    prevout_script='OP_DUP OP_HASH160 ' + hash160 + ' OP_EQUALVERIFY OP_CHECKSIG'
    
    response={"status": 200, "transaction": unsigned_raw_tx, "sourceScript": prevout_script }
    return jsonify(response)

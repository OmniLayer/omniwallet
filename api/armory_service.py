import urlparse
import os, sys, re, random,pybitcointools, bitcoinrpc, math
from decimal import Decimal
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

sys.path.append("/usr/lib/armory/")
from armoryengine.ALL import *

app = Flask(__name__)
app.debug = True


@app.route('/getunsigned', methods=['POST'])
def generate_unsigned():
    unsigned_hex = request.form['unsigned_hex']
    pubkey = request.form['pubkey']
    #Translate raw txn
    pytx = PyTx()
    print("Encoding raw txn: %s" % unsigned_hex)
    binTxn = hex_to_binary(unsigned_hex)
    pytx.unserialize(binTxn)
    tx = PyTxDistProposal(pytx)
    print("\n\nOutput is:\n%s" % tx.serializeAscii())  
    return jsonify({'armoryUnsigned':tx.serializeAscii()})  
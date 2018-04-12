import urlparse
import os, sys, re, random,pybitcointools, bitcoinrpc, math
from decimal import Decimal
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *
from blockchain_utils import *
import config
from omnitransaction import OmniTransaction

#conn = bitcoinrpc.connect_to_local()
conn = getRPCconn()
#tools_dir = os.environ.get('TOOLSDIR')
#lib_path = os.path.abspath(tools_dir)
#sys.path.append(lib_path)
#data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

HEXSPACE_SECOND='21'
mainnet_exodus_address='1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P'
testnet_exodus_address='mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv'
magicbyte=0
testnet=False
exodus_address=mainnet_exodus_address

@app.route('/<int:tx_type>', methods=['POST'])
def generate_tx(tx_type):

    #update this to support more transactions
    supported_transactions = [50,51,54,55,56,0,20,22,25,26,27,28,70]

    if tx_type not in supported_transactions:
        return jsonify({ 'status': 400, 'data': 'Unsupported transaction type '+str(tx_type) })
    
    expected_fields=['transaction_version', 'transaction_from','pubkey','fee']
    null_fields=['property_category', 'property_subcategory','property_url', 'property_data']

    print "Form ",request.form

    #might add tx 00, 53, etc later;
    if tx_type == 50:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'number_properties']
    elif tx_type == 51:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'currency_identifier_desired', 'number_properties', 'deadline', 'earlybird_bonus', 'percentage_for_issuer']
    elif tx_type == 54:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data']
    elif tx_type == 0:
        expected_fields+=['currency_identifier', 'amount_to_transfer', 'transaction_to']
    elif tx_type == 20:
        expected_fields+=['currency_identifier', 'amount_for_sale', 'amount_desired', 'blocks', 'min_buyer_fee','action']
    elif tx_type == 22:
        expected_fields+=['tx_hash', 'amount']
    elif tx_type in [55,56]:
        expected_fields+=['currency_identifier', 'amount']
    elif tx_type == 25:
        expected_fields+=['propertyidforsale', 'amountforsale', 'propertiddesired', 'amountdesired']
    elif tx_type == 26:
        expected_fields+=['propertyidforsale', 'amountforsale', 'propertiddesired', 'amountdesired']
    elif tx_type == 27:
        expected_fields+=['propertyidforsale', 'propertiddesired']
    elif tx_type == 28:
        expected_fields+=['ecosystem']
    elif tx_type == 70:
        expected_fields+=['currency_identifier', 'transaction_to']

    for field in expected_fields:
        if field not in request.form:
            return jsonify({ 'status': 403, 'data': 'No field in request form '+field })
        elif request.form[field] == '' and field not in null_fields:
            return jsonify({ 'status': 403, 'data': 'Empty field in request form '+field })
    
    tx = OmniTransaction(tx_type, request.form)

    return jsonify(tx.get_unsigned())

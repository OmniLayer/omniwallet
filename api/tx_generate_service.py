import urlparse
import os, sys, re, random,pybitcointools, bitcoinrpc, math
from decimal import Decimal
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

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
    supported_transactions = [50,51, 0]

    if tx_type not in supported_transactions:
        return jsonify({ 'status': 400, 'data': 'Unsupported transaction type '+str(tx_type) })
    
    expected_fields=['transaction_version', 'transaction_from','pubkey','fee']

    print "Form ",request.form

    #might add tx 00, 53, etc later;
    if tx_type == 50:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'number_properties']
    elif tx_type == 51:
        expected_fields+=['ecosystem', 'property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'currency_identifier_desired', 'number_properties', 'deadline', 'earlybird_bonus', 'percentage_for_issuer']
    elif tx_type == 0:
        expected_fields+=['currency_identifier', 'amount_to_transfer', 'transaction_to']
    for field in expected_fields:
        if field not in request.form:
            return jsonify({ 'status': 403, 'data': 'No field in request form '+field })
        elif request.form[field] == '':
            return jsonify({ 'status': 403, 'data': 'Empty field in request form '+field })

    if 'testnet' in request.form and ( request.form['testnet'] in ['true', 'True'] ):
        global testnet
        testnet =True
        global magicbyte
        magicbyte = 111
        global exodus_address
        exodus_address=testnet_exodus_address

    txdata = prepare_txdata(tx_type, request.form)
    if tx_type == 50:
        try:
            tx50bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx50bytes[0], tx50bytes[1], request.form['transaction_from'] )
            unsignedhex = build_transaction( request.form['fee'], request.form['pubkey'], packets[0], packets[1], packets[2], request.form['transaction_from'])
            
            #DEBUG print tx50bytes, packets, unsignedhex
            return jsonify({ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] });
        except Exception as e:
            error=jsonify({ 'status': 502, 'data': 'Unspecified error '+str(e)}) 
            return error
    elif tx_type == 51:
        try:
            tx51bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx51bytes[0], tx51bytes[1], request.form['transaction_from'])
            unsignedhex= build_transaction( request.form['fee'], request.form['pubkey'], packets[0], packets[1], packets[2], request.form['transaction_from'])
            #DEBUG print tx51bytes, packets, unsignedhex
            return jsonify({ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] });
        except Exception as e:
            error=jsonify({ 'status': 502, 'data': 'Unspecified error '+str(e)}) 
            return error
    elif tx_type == 0:
        try:
            tx0bytes = prepare_txbytes(txdata)
            packets = construct_packets( tx0bytes[0], tx0bytes[1], request.form['transaction_from'])
            unsignedhex= build_transaction( request.form['fee'], request.form['pubkey'], packets[0], packets[1], packets[2], request.form['transaction_from'], request.form['transaction_to'])
            #DEBUG print tx0bytes, packets, unsignedhex
            return jsonify({ 'status': 200, 'unsignedhex': unsignedhex[0] , 'sourceScript': unsignedhex[1] });
        except Exception as e:
            error=jsonify({ 'status': 502, 'data': 'Unspecified error '+str(e)}) 
            return error

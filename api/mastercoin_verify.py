import os
import glob
import re
from flask import Flask, request, jsonify, abort, json

data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True


@app.route('/addresses')
def addresses():
  currency_id = request.args.get('currency_id')
  response = []
  addr_glob = glob.glob(data_dir_root + '/addr/*.json')

  for address_file in addr_glob:
    with open(address_file, 'r') as f:
      addr = json.load(f)
      res = {
          'address': addr['address']
      }

      if currency_id == '0':
        btc_balance = [x['value'] for x in addr['balance'] if x['symbol'] == 'BTC'][0]
        res['balance'] = ('%.8f' % float(btc_balance)).rstrip('0').rstrip('.')
        response.append(res)
      else:
        adjust_currency_id = currency_id
        if currency_id == '1' or currency_id == '2':
          adjust_currency_id = str(int(currency_id) - 1) # Mastercoin-tools is off by one on currency id from the spec

        if adjust_currency_id in addr:
          res['balance'] = ('%.8f' % float(addr[adjust_currency_id]['balance'])).rstrip('0').rstrip('.')
          response.append(res)

  json_response = json.dumps(response)
  return json_response


@app.route('/transactions/<address>')
def transactions(address=None):
  currency_id = request.args.get('currency_id')

  print address, currency_id

  if address == None:
    abort(400)

  if not exists(address):
    abort(404)

  addr = read(address)
  transactions = []
  tx_lists = ['accept_transactions', 'bought_transactions', 'exodus_transactions', 'offer_transactions', 'received_transactions', 'sent_transactions', 'sold_transactions']

  if currency_id == '0':
    return jsonify({ 'address': address, 'transactions': transactions }) # Punt on bitcoin transactions since we don't store them

  if currency_id == '1' or currency_id == '2':
    currency_id = str(int(currency_id) - 1) # Mastercoin-tools is off by one on currency id from the spec

  if currency_id in addr:
    for tx_i in tx_lists:
      for tx in addr[currency_id][tx_i]:
        transactions.append(tx_clean(tx))

  return jsonify({ 'address': address, 'transactions': transactions })


# Utilities
def tx_clean(tx):
  clean = {
      'tx_hash': tx['tx_hash'],
      'valid': True,
      'accepted_amount': tx['formatted_amount']
  }

  if 'bitcoin_required' in tx:
    clean['bought_amount'] = tx['bitcoin_required']

  return clean

def read(address):
  if not re.match('^[a-zA-Z0-9_]+$', address):
    raise ValueError('Non Alphanumeric address')

  filename = data_dir_root + '/addr/' + address + '.json'
  with open(filename, 'r') as f:
    return json.load(f)

def exists(address):
  filename = data_dir_root + '/addr/' + address + '.json'
  return os.path.exists(filename)

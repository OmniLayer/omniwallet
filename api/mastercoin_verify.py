import os
import glob
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
        res['balance'] = float(btc_balance)
        response.append(res)
      else:
        if currency_id == '1' or currency_id == '2':
          msc_currency_id = str(int(currency_id) - 1) # Mastercoin-tools is off by one on currency id from the spec

        if msc_currency_id in addr:
          res['balance'] = float(addr[msc_currency_id]['balance'])
          response.append(res)

  json_response = json.dumps(response)
  return json_response


@app.route('/transactions/<address>')
def transactions(address=None):

  return ""

import os
import glob
import re
from flask import Flask, request, jsonify, abort, json
import psycopg2, psycopg2.extras
import msc_apps

sqlconn = msc_apps.sql_connect()
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

@app.route('/properties')
def properties():
  prop_glob = glob.glob(data_dir_root + '/properties/*.json')

  response = []
  for property_file in prop_glob:
    with open(property_file, 'r') as f:
      prop = json.load(f)[0]
      response.append({ 'currencyID': prop['currencyId'], 'name': prop['propertyName'] })

  json_response = json.dumps( sorted(response, key=lambda x:  int(x['currencyID']) ))
  return json_response

@app.route('/addresses')
def addresses():
  currency_id = request.args.get('currency_id')
  response = []
  #addr_glob = glob.glob(data_dir_root + '/addr/*.json')

  currency_id = re.sub(r'\D+', '', currency_id) #check alphanumeric
  sqlconn.execute("select * from addressbalances where propertyid=" + str(currency_id))
  ROWS= sqlconn.fetchall()

  for addrrow in ROWS:
      res = {
          'address': addrrow[0]
      }

      if currency_id == '0': #BTC
        res['balance'] = ('%.8f' % float(addrrow[4])).rstrip('0').rstrip('.')
        response.append(res)
      else:
        res['balance'] = ('%.8f' % float(addrrow[4])).rstrip('0').rstrip('.')
        res['reserved_balance'] = ('%.8f' % float(addrrow[5])).rstrip('0').rstrip('.')
        response.append(res)

  json_response = json.dumps(response)
  return json_response


@app.route('/transactions/<address>')
def transactions(address=None):
  currency_id = request.args.get('currency_id')

  print address, currency_id

  if address == None:
    abort(400)

  currency_id = re.sub(r'\D+', '', currency_id) #check alphanumeric

  sqlconn.execute("select * from addressesintxs a, transactions t where a.address=\'"+address+"\' and a.txdbserialnum = t.txdbserialnum and a.propertyid=" + str(currency_id))
  ROWS= sqlconn.fetchall()

  transactions = []
  for txrow in ROWS:
      transactions.append(txrow[9])

  return jsonify({ 'address': address, 'transactions': transactions })


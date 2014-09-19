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

#TODO COnversion
@app.route('/properties')
def properties():
  sqlconn.execute("select * from smartproperties")
  ROWS= sqlconn.fetchall()

  def dehexify(hex_str):
      temp_str=[]
      for let in hex_str:
          if ord(let) < 128:
              temp_str.append(let)
          else:
              temp_str.append('?')
      return ''.join(temp_str)

  response = []
  for sprow in ROWS:
      res = {
          'currencyID': sprow[1],
          'name': dehexify(sprow[-1]['name']) 
      }
      response.append(res)

  json_response = json.dumps( sorted(response, key=lambda x:  int(x['currencyID']) ))
  return json_response

@app.route('/addresses')
def addresses():
  currency_id = request.args.get('currency_id')
  response = []

  currency_id = re.sub(r'\D+', '', currency_id) #check alphanumeric
  #sqlconn.execute("select address,balanceavailable,balancereserved, from addressbalances ab,  where propertyid=" + str(currency_id))
  sqlconn.execute("select address,balanceavailable,balancereserved,sp.propertytype from addressbalances ab, smartproperties sp where ab.propertyid=sp.propertyid and sp.propertyid=" + str(currency_id))
  ROWS= sqlconn.fetchall()

  for addrrow in ROWS:
      res = {
          'address': addrrow[0]
      }
      divisible=addrrow[3]

      if currency_id == '0': #BTC
        res['balance'] = ('%.8f' % float(addrrow[1])).rstrip('0').rstrip('.')
        response.append(res)
      else:
        if divisible:
          res['balance'] = ('%.8f' % float(addrrow[1])).rstrip('0').rstrip('.')
          res['reserved_balance'] = ('%.8f' % float(addrrow[2])).rstrip('0').rstrip('.')
        else:
          res['balance'] = ('%.8f' % float(addrrow[1]/10000000)).rstrip('0').rstrip('.')
          res['reserved_balance'] = ('%.8f' % float(addrrow[2]/10000000)).rstrip('0').rstrip('.')
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


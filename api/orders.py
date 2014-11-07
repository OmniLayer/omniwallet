from flask import Flask, request, jsonify, abort, json
#import psycopg2, psycopg2.extras
from msc_apps import *

app = Flask(__name__)
app.debug = True

@app.route('/v1/exchange/orders')
def orders():

  maxblock=dbSelect("select max(blocknumber) from orderblob")[0][0]
  orders=json.loads(dbSelect("select orders from orderblob where blocknumber=%s",[maxblock])[0][0])

  return (orders, None)

from flask import Flask, request, jsonify, abort, json
from msc_apps import *

app = Flask(__name__)
app.debug = True

@app.route('/')
def orders():

  maxblock=dbSelect("select max(blocknumber) from orderblob")[0][0]
  orders=json.loads(dbSelect("select orders from orderblob where blocknumber=%s",[maxblock])[0][0])

  return json.dumps(orders)


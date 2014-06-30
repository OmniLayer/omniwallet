import requests
import os, sys, re, random
import requests
from decimal import Decimal
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

@app.route('/getlast', methods=['POST'])
def getlast():
    try:
        origin = request.form['origin']
    except KeyError:
        abort(make_response('No field \'origin\' in request, request failed', 400))
        
    if origin == "blockchain":
        block= request.get('https://blockchain.info/latestblock')
        return jsonify(block.json())
    else:
        abort(make_response('Unsupported origin', 400))

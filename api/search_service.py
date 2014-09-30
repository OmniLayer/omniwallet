import urlparse
import os, sys, re
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *
import glob, json
import requests

#tools_dir = os.environ.get('TOOLSDIR')
#lib_path = os.path.abspath(tools_dir)
#sys.path.append(lib_path)
#data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

@app.route('/', methods=['GET'])
def search():
  if 'query' in request.args:
      query = re.sub(r'\W+', '0', request.args.get('query') ) # strip and get query
  else:
      return jsonify({ 'status': 400, 'data': 'No query found in request' })

  ROWS=dbSelect("select * from transactions t, txjson txj where t.txhash ~* \'" + str(query) + "\' and t.txdbserialnum=txj.txdbserialnum")

  response = []
  if len(ROWS) > 0:
    for queryrow in ROWS:
      res = requests.get('http://localhost/v1/transaction/tx/' + queryrow[0] + '.json').json()[0]
      response.append(res)

  return json.dumps({ 'status': 200, 'data': response })

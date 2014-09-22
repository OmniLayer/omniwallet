from flask import Flask, request, jsonify, abort, json
from sqltools import *

app = Flask(__name__)
app.debug = True

#TODO COnversion
@app.route('/revision')
def revision():
  ROWS=dbSelect("select blocknumber, blocktime from blocks order by blocknumber desc limit 1")

  response = []
  for datarow in ROWS:
      res = {
          'last_block': datarow[0],
          'last_parsed': datarow[1] 
      }
      response.append(res)

  json_response = json.dumps( sorted(response, key=lambda x:  int(x['last_block']) ))
  return json_response

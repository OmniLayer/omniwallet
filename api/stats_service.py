from flask import Flask, request, jsonify, abort, json
from sqltools import *

app = Flask(__name__)
app.debug = True

#TODO COnversion
@app.route('/revision')
def revision():
  ROWS=dbSelect("select blocknumber, blocktime from blocks order by blocknumber desc limit 1")

  response = {
          'last_block': ROWS[0][0],
          'last_parsed': ROWS[0][1] 
      }

  json_response = json.dumps( response)
  return json_response

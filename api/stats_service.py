from flask import Flask, request, jsonify, abort, json
from sqltools import *
import commands

app = Flask(__name__)
app.debug = True

@app.route('/status')
def status():
  rev=revision().get_data()
  print rev
  try:
    rev=json.loads(rev)
  except:
    rev={'revision':rev}

  st=stats().get_data()
  print st
  try:
    st=json.loads(st)
  except:
    st={'stats':st}

  coms=commits().get_data()
  print coms
  try:
    coms=json.loads(coms)
  except:
    coms={'commits':coms}

  #print rev, st, coms
  merged_response = {key: value for (key, value) in (rev.items() + st.items() + coms.items())}
  return jsonify(merged_response)


@app.route('/revision')
def revision():
  ROWS=dbSelect("select blocknumber, blocktime from blocks order by blocknumber desc limit 1")

  response = {
          'last_block': ROWS[0][0],
          'last_parsed': ROWS[0][1]
      }

  json_response = jsonify(response)
  return json_response


@app.route('/stats')
def stats():
  ROWS=dbSelect("select count(walletid) from wallets where walletstate='Active'")

  response = {
          'amount_of_wallets': ROWS[0][0]
      }

  json_response = jsonify(response)
  return json_response


@app.route('/commits')
def commits():
  owlog=commands.getoutput('git --git-dir=../.git log --pretty=tformat:"%cd | %h | %H | %s" --date=short -n 12 --no-merges')

  response=[]
  for x in owlog.split('\n'):
    y=x.split('|', 3)
    response.append({
      'date': str(y[0]),
      'commitshort': str(y[1].strip()),
      'commitlong': str(y[2].strip()),
      'msg': str(y[3].strip())
    })

  json_response = jsonify({'commits': response})
  return json_response

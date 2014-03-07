import werkzeug.security as ws
from flask import Flask, request, jsonify, abort
app = Flask(__name__)
app.debug = True

LOGIN_DIFFICULTY = '0400'
SERVER_SECRET = 'SoSecret!'

@app.route('/salt')
def challenge():
  uuid = request.args.get('uuid', '')
  salt = ws.hashlib.sha256(SERVER_SECRET + uuid).hexdigest()
  pow_challenge = ws.gen_salt(32)

  response = {
      'salt': salt,
      'pow_challenge': pow_challenge
  }
  return jsonify(response)


@app.route('/create', methods=['POST'])
def create():
  print request.form
  uuid = request.form['uuid']
  key = request.form['key']
  nonce = request.form['nonce']
  pow_challenge = request.form['pow_challenge']
  #wallet_data = request.form['wallet_data']

  challenge_response = ws.hashlib.sha256(nonce + pow_challenge).hexdigest()

  if challenge_response[-len(LOGIN_DIFFICULTY):] != LOGIN_DIFFICULTY:
    print 'Aborting: Challenge was not met'
    abort(403)



  return ""


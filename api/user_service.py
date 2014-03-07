import os
import werkzeug.security as ws
from flask import Flask, request, jsonify, abort, json
app = Flask(__name__)
app.debug = True

LOGIN_DIFFICULTY = '0400'
SERVER_SECRET = 'SoSecret!'
data_dir_root = os.environ.get('DATADIR')

@app.route('/salt')
def challenge():
  uuid = request.args.get('uuid', '')

  if exists(uuid):
    abort(403)

  salt = ws.hashlib.sha256(SERVER_SECRET + uuid).hexdigest()
  pow_challenge = ws.gen_salt(32)

  response = {
      'salt': salt,
      'pow_challenge': pow_challenge
  }
  return jsonify(response)


@app.route('/create', methods=['POST'])
def create():
  uuid = request.form['uuid']
  key = request.form['key']
  nonce = request.form['nonce']
  pow_challenge = request.form['pow_challenge']
  #wallet_data = request.form['wallet_data']
  wallet_data = "Walletstuff"

  challenge_response = ws.hashlib.sha256(nonce + pow_challenge).hexdigest()

  if challenge_response[-len(LOGIN_DIFFICULTY):] != LOGIN_DIFFICULTY:
    print 'Aborting: Challenge was not met'
    abort(403)

  if exists(uuid):
    abort(403)

  wallet_file = { 'key': key, 'wallet': wallet_data }
  write_wallet(uuid, wallet_file)

  return ""


def write_wallet(uuid, wallet_file):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'w') as f:
    json.dump(wallet_file, f)

def exists(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  return os.path.exists(filename)

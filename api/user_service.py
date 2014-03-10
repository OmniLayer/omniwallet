import os
import werkzeug.security as ws
from flask import Flask, request, jsonify, abort, json
from simplekv.fs import FilesystemStore

LOGIN_DIFFICULTY = '0400'
SERVER_SECRET = 'SoSecret!'
data_dir_root = os.environ.get('DATADIR')

store_dir = data_dir_root + '/sessions/'
session_store = FilesystemStore(store_dir) # TODO: Need to roll this into a SessionInterface so multiple services can hit it easily
SESSION_SECRET = 'SuperSecretSessionStuff'

app = Flask(__name__)
app.debug = True

@app.route('/salt')
def challenge():
  uuid = request.args.get('uuid', '')
  session_id = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  if session_id in session_store:
    abort(403)

  salt = ws.hashlib.sha256(SERVER_SECRET + uuid).hexdigest()
  pow_challenge = ws.gen_salt(32)

  session_store.put(session_id, pow_challenge)
  response = {
      'salt': salt,
      'pow_challenge': pow_challenge
  }
  return jsonify(response)


@app.route('/create', methods=['POST'])
def create():
  uuid = request.form['uuid']
  session_id = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  if session_id not in session_store:
    print 'UUID not in session'
    abort(403)

  key = request.form['key']
  nonce = request.form['nonce']
  pow_challenge = session_store.get(session_id)
  #wallet_data = request.form['wallet_data']
  wallet_data = "Walletstuff"

  challenge_response = ws.hashlib.sha256(pow_challenge + nonce).hexdigest()

  if challenge_response[-len(LOGIN_DIFFICULTY):] != LOGIN_DIFFICULTY:
    print 'Aborting: Challenge was not met'
    abort(403)

  if exists(uuid):
    print 'UUID already exists'
    abort(403)

  wallet_file = { 'key': key, 'wallet': wallet_data }
  write_wallet(uuid, wallet_file)
  session_store.delete(session_id)

  return ""


def write_wallet(uuid, wallet_file):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'w') as f:
    json.dump(wallet_file, f)

def exists(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  return os.path.exists(filename)

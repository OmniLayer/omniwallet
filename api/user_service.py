import os
import werkzeug.security as ws
from flask import Flask, request, jsonify, abort, json
from simplekv.fs import FilesystemStore

ACCOUNT_CREATION_DIFFICULTY = '0400'
ACCOUNT_CREATION_DIFFICULTY = '0400'

SERVER_SECRET = 'SoSecret!'
SESSION_SECRET = 'SuperSecretSessionStuff'
data_dir_root = os.environ.get('DATADIR')

store_dir = data_dir_root + '/sessions/'
session_store = FilesystemStore(store_dir) # TODO: Need to roll this into a SessionInterface so multiple services can hit it easily

app = Flask(__name__)
app.debug = True

@app.route('/challenge')
def challenge():
  uuid = request.args.get('uuid')
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  session_challenge = session + "_challenge"
  session_pow_challenge = session + "_pow_challenge"

  if session_pow_challenge in session_store:
    print 'pow_challenge already in session_store'
    abort(403)
  if session_challenge in session_store:
    print 'challenge already in session_store'
    session_store.delete(session_challenge)

  salt = ws.hashlib.sha256(SERVER_SECRET + uuid).hexdigest()
  pow_challenge = ws.gen_salt(32)
  challenge = ws.gen_salt(32)

  session_store.put(session_pow_challenge, pow_challenge)
  session_store.put(session_challenge, challenge)
  print session_challenge
  response = {
      'salt': salt,
      'pow_challenge': pow_challenge,
      'challenge': challenge
  }
  return jsonify(response)


@app.route('/create', methods=['POST'])
def create():
  uuid = request.form['uuid']
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  session_pow_challenge = session + "_pow_challenge"

  if session_pow_challenge not in session_store:
    print 'UUID not in session'
    abort(403)

  nonce = request.form['nonce']
  public_key = request.form['public_key']
  pow_challenge = session_store.get(session_pow_challenge)
  wallet = request.form['wallet']

  challenge_response = ws.hashlib.sha256(pow_challenge + nonce).hexdigest()

  if challenge_response[-len(ACCOUNT_CREATION_DIFFICULTY):] != ACCOUNT_CREATION_DIFFICULTY:
    print 'Aborting: Challenge was not met'
    abort(403)

  if exists(uuid):
    print 'UUID already exists'
    abort(403)

  write_wallet(uuid, wallet)
  session_store.delete(session_pow_challenge)

  return ""

@app.route('/update', methods=['POST'])
def update():
  uuid = request.form['uuid']
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  session_challenge = session + "_challenge"
  print session_challenge

  if session_challenge not in session_store:
    print 'Challenge not in session'
    abort(403)

  challenge = request.form['challenge']
  signature = request.form['signature']
  wallet = request.form['wallet']

  if challenge != session_store.get(session_challenge):
    print 'Challenge not met'
    abort(403)

  write_wallet(uuid, wallet)
  session_store.delete(session_challenge)

  return ""

@app.route('/login')
def login():
  uuid = request.args.get('uuid')
  return ""

def write_wallet(uuid, wallet):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'w') as f:
    f.write(wallet)

def exists(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  return os.path.exists(filename)

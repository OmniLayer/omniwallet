import os
import base64
import werkzeug.security as ws
from flask import Flask, request, jsonify, abort, json
from simplekv.fs import FilesystemStore
from uuid import UUID

ACCOUNT_CREATION_DIFFICULTY = '0400'
LOGIN_DIFFICULTY = '0400'

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
    session_store.delete(session_pow_challenge)

  if session_challenge in session_store:
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
  public_key = request.form['public_key'].encode('UTF-8')
  wallet = request.form['wallet']

  pow_challenge = session_store.get(session_pow_challenge)
  if failed_challenge(pow_challenge, nonce, ACCOUNT_CREATION_DIFFICULTY):
    print 'Aborting: Challenge was not met'
    abort(403)

  if exists(uuid):
    print 'UUID already exists'
    abort(403)

  write_wallet(uuid, wallet)
  session_store.delete(session_pow_challenge)
  session_public_key = session + "_public_key"
  session_store.put(session_public_key, public_key)

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
  public_key = base64.b64decode(request.args.get('public_key').encode('UTF-8'))
  nonce = request.args.get('nonce')

  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  session_pow_challenge = session + "_pow_challenge"

  if session_pow_challenge not in session_store:
    print 'UUID not in session'
    abort(403)

  pow_challenge = session_store.get(session_pow_challenge)
  if failed_challenge(pow_challenge, nonce, LOGIN_DIFFICULTY):
    print 'Failed login challenge'
    abort(403)

  if not exists(uuid):
    print 'Wallet not found'
    abort(404)

  wallet_data = read_wallet(uuid)
  session_store.delete(session_pow_challenge)
  session_public_key = session + "_public_key"
  session_store.put(session_public_key, public_key)

  return wallet_data




# Utility Functions
def failed_challenge(pow_challenge, nonce, difficulty):
  pow_challenge_response = ws.hashlib.sha256(pow_challenge + nonce).hexdigest()
  return pow_challenge_response[-len(difficulty):] != difficulty

def write_wallet(uuid, wallet):
  validate_uuid = UUID(uuid)
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'w') as f:
    f.write(wallet)

def read_wallet(uuid):
  validate_uuid = UUID(uuid)
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'r') as f:
    return f.read()

def exists(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  return os.path.exists(filename)

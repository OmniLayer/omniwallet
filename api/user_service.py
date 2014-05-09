import os
import base64
import werkzeug.security as ws
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA
from Crypto.PublicKey import RSA
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
  validate_uuid = UUID(request.args.get('uuid'))
  uuid = str(validate_uuid)
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
  response = {
      'salt': salt,
      'pow_challenge': pow_challenge,
      'challenge': challenge
  }

  return jsonify(response)


@app.route('/create', methods=['POST'])
def create():
  validate_uuid = UUID(request.form['uuid'])
  uuid = str(validate_uuid)
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
  validate_uuid = UUID(request.form['uuid'])
  uuid = str(validate_uuid)
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  session_challenge = session + "_challenge"
  session_pubkey = session + "_public_key"

  if session_challenge not in session_store:
    print 'Challenge not in session'
    abort(403)

  if session_pubkey not in session_store:
    print 'Public key not in session'
    abort(403)

  challenge = session_store.get(session_challenge)
  signature = request.form['signature']
  wallet = request.form['wallet']
  pubkey = session_store.get(session_pubkey)

  key = RSA.importKey(pubkey)
  h = SHA.new(challenge)
  verifier = PKCS1_v1_5.new(key)

  if not verifier.verify(h, signature.decode('hex')):
    print 'Challenge signature not verified'
    abort(403)

  write_wallet(uuid, wallet)
  session_store.delete(session_challenge)

  return ""


@app.route('/login')
def login():
  validate_uuid = UUID(request.args.get('uuid'))
  uuid = str(validate_uuid)
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
    abort(403)

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
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'w') as f:
    f.write(wallet)

def read_wallet(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  with open(filename, 'r') as f:
    return f.read()

def exists(uuid):
  validate_uuid = UUID(uuid)
  filename = data_dir_root + '/wallets/' + uuid + '.json'
  return os.path.exists(filename)

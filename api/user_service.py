import socket
import smtplib
import os
import base64
import werkzeug.security as ws
from Crypto.Signature import PKCS1_v1_5
from Crypto.Hash import SHA
from Crypto.PublicKey import RSA
from flask import Flask, request, jsonify, abort, json
from simplekv.fs import FilesystemStore
from uuid import UUID
from email.MIMEMultipart import MIMEMultipart
from email.MIMEBase import MIMEBase
from email.MIMEText import MIMEText
from email.Utils import COMMASPACE, formatdate
from email import Encoders
from sqltools import *

#For wallets and session store you can switch between disk and the database
#Set to 1 to use local storage/file system, Set to 0 to use database
LOCALDEVBYPASSDB=0

ACCOUNT_CREATION_DIFFICULTY = '0400'
LOGIN_DIFFICULTY = '0400'

SERVER_SECRET = 'SoSecret!'
SESSION_SECRET = 'SuperSecretSessionStuff'
data_dir_root = os.environ.get('DATADIR')

store_dir = data_dir_root + '/sessions/'
session_store = FilesystemStore(store_dir) # TODO: Need to roll this into a SessionInterface so multiple services can hit it easily

email_domain = socket.gethostname()
email_from = "noreply@"+str(email_domain)

app = Flask(__name__)
app.debug = True


@app.route('/challenge')
def challenge():
  validate_uuid = UUID(request.args.get('uuid'))
  uuid = str(validate_uuid)
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()
  salt = ws.hashlib.sha256(SERVER_SECRET + uuid).hexdigest()
  pow_challenge = ws.gen_salt(32)
  challenge = ws.gen_salt(32)

  if LOCALDEVBYPASSDB:
    session_challenge = session + "_challenge"
    session_pow_challenge = session + "_pow_challenge"

    if session_pow_challenge in session_store:
      session_store.delete(session_pow_challenge)

    if session_challenge in session_store:
      session_store.delete(session_challenge)

    session_store.put(session_pow_challenge, pow_challenge)
    session_store.put(session_challenge, challenge)
  else:
    dbExecute("with upsert as (update sessions set challenge=%s, pchallenge=%s, timestamp=DEFAULT where sessionid=%s returning *) "
              "insert into sessions (sessionid, challenge, pchallenge) select %s,%s,%s where not exists (select * from upsert)", 
              (challenge, pow_challenge, session, session, challenge, pow_challenge))
    dbCommit()
    
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

  email = request.form['email'] if 'email' in request.form else None
  nonce = request.form['nonce']
  public_key = request.form['public_key'].encode('UTF-8')
  wallet = request.form['wallet']

  if LOCALDEVBYPASSDB:
    session_pow_challenge = session + "_pow_challenge"
    if session_pow_challenge not in session_store:
      print 'UUID not in session'
      abort(403)

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
  else:
    ROWS=dbSelect("select pchallenge from sessions where sessionid=%s",[session])
    if len(ROWS)==0 or ROWS[0][0]==None:
      print 'UUID not in session'
      abort(403)
    else:
      pow_challenge = ROWS[0][0]

    if failed_challenge(pow_challenge, nonce, ACCOUNT_CREATION_DIFFICULTY):
      print 'Aborting: Challenge was not met'
      abort(403)

    if exists(uuid):
      print 'UUID already exists'
      abort(403)

    write_wallet(uuid, wallet, email)
    dbExecute("update sessions set pchallenge=NULL, timestamp=DEFAULT, pubkey=%s where sessionid=%s",(public_key, session))
    dbCommit()

  welcome_email(email, wallet, uuid)

  return ""


@app.route('/update', methods=['POST'])
def update():
  validate_uuid = UUID(request.form['uuid'])
  uuid = str(validate_uuid)
  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()

  if LOCALDEVBYPASSDB:
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
  else:
    ROWS=dbSelect("select challenge,pubkey from sessions where sessionid=%s",[session])
    if len(ROWS)==0 or ROWS[0][0]==None:
      print 'Challenge not in session'
      abort(403)

    if len(ROWS)==0 or ROWS[0][1]==None:
      print 'Public key not in session'
      abort(403)


    challenge = ROWS[0][0]
    signature = request.form['signature']
    wallet = request.form['wallet']
    pubkey = ROWS[0][1]

    key = RSA.importKey(pubkey)
    h = SHA.new(challenge)
    verifier = PKCS1_v1_5.new(key)

    if not verifier.verify(h, signature.decode('hex')):
      print 'Challenge signature not verified'
      abort(403)

    write_wallet(uuid, wallet)
    dbExecute("update sessions set challenge=NULL, timestamp=DEFAULT where sessionid=%s",[session])
    dbCommit()

  return ""


@app.route('/login')
def login():
  validate_uuid = UUID(request.args.get('uuid'))
  uuid = str(validate_uuid)
  public_key = base64.b64decode(request.args.get('public_key').encode('UTF-8'))
  nonce = request.args.get('nonce')

  session = ws.hashlib.sha256(SESSION_SECRET + uuid).hexdigest()

  if LOCALDEVBYPASSDB:
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
  else:
    ROWS=dbSelect("select pchallenge from sessions where sessionid=%s",[session])
    if len(ROWS)==0 or ROWS[0][0]==None:
      print 'UUID not in session'
      abort(403)
    else:
      pow_challenge = ROWS[0][0]

    if failed_challenge(pow_challenge, nonce, LOGIN_DIFFICULTY):
      print 'Failed login challenge'
      abort(403)

    if not exists(uuid):
      print 'Wallet not found'
      abort(403)

    wallet_data = read_wallet(uuid)
    dbExecute("update sessions set pchallenge=NULL, timestamp=DEFAULT, pubkey=%s where sessionid=%s",(public_key, session))
    dbCommit()
    update_login(uuid)
  #end else: 
  return wallet_data




# Utility Functions
def failed_challenge(pow_challenge, nonce, difficulty):
  pow_challenge_response = ws.hashlib.sha256(pow_challenge + nonce).hexdigest()
  return pow_challenge_response[-len(difficulty):] != difficulty

def write_wallet(uuid, wallet, email=None):
  if LOCALDEVBYPASSDB:
    filename = data_dir_root + '/wallets/' + uuid + '.json'
    with open(filename, 'w') as f:
      f.write(wallet)
  else:
    dbExecute("with upsert as (update wallets set walletblob=%s where walletid=%s returning *) "
              "insert into wallets (walletblob,walletid,email) select %s,%s,%s where not exists (select * from upsert)", 
              (wallet,uuid,wallet,uuid,email))
    dbCommit()
    
def read_wallet(uuid):
  if LOCALDEVBYPASSDB:
    filename = data_dir_root + '/wallets/' + uuid + '.json'
    with open(filename, 'r') as f:
      return f.read()
  else:
    ROWS=dbSelect("select walletblob from wallets where walletid=%s",[uuid])
    #check if the wallet is in the database and if not insert it 
    if len(ROWS)==0:
      filename = data_dir_root + '/wallets/' + uuid + '.json'
      with open(filename, 'r') as f:
        blob= f.read()
      write_wallet(uuid,blob)
      return blob
    else:
      return ROWS[0][0]

def update_login(uuid):
   dbExecute("update wallets set lastlogin=DEFAULT where walletid=%s",[uuid])
   dbCommit()

def exists(uuid):
  if LOCALDEVBYPASSDB:
    validate_uuid = UUID(uuid)
    filename = data_dir_root + '/wallets/' + uuid + '.json'
    return os.path.exists(filename)
  else: 
    validate_uuid = UUID(uuid)
    ROWS=dbSelect("select walletid from wallets where walletid=%s",[uuid])
    #check the database first then filesystem
    if len(ROWS)==0:
      filename = data_dir_root + '/wallets/' + uuid + '.json'
      return os.path.exists(filename)
    else:
      return True


def welcome_email(user_email, wallet, uuid):
  if user_email is not None:
    msg = MIMEMultipart('alternative')
    msg['From'] = email_from
    msg['To'] = user_email
    msg['Subject'] = "Welcome to Omniwallet"

    text = ('Welcome to Omniwallet\n'
            'This email contains important information about your new Omniwallet. Be sure to keep this safe and stored seperately from your password\n\n'
            'Wallet Id: '+str(uuid)+'\n'
            'Login Link: https://'+str(email_domain)+'/login/'+str(uuid)+'\n\n\n'
            'Do not Forget Your Password!\n'
            'WARNING: Forgotten passwords are UNRECOVERABLE and will results in LOSS of ALL of your coins!' )


    html = ('<html><head></head>'
            '<h2>Welcome to Omniwallet</h2>'
            '<body><p>'
            'This email contains important information about your new Omniwallet. Be sure to keep this safe and stored seperately from your password<br><br>'
            '<b>Wallet Id:</b> '+str(uuid)+'<br>'
            '<b>Login Link:</b> <a href="https://'+str(email_domain)+'/login/'+str(uuid)+'">https://'+str(email_domain)+'/login/'+str(uuid)+'<br><br><br>'
            '<h3>Do not Forget Your Password!</h3><br>'
            '<b>WARNING:</b> Forgotten passwords are UNRECOVERABLE and will results in LOSS of ALL funds in your wallet not backed up!<br>'
            '</p></body></html>'  )

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)

    #wfile = MIMEBase('application', 'octet-stream')
    #wfile.set_payload(wallet)
    #Encoders.encode_base64(wfile)
    #wfile.add_header('Content-Disposition', 'attachment', filename=uuid+'.json')
    #msg.attach(wfile)
    smtp = smtplib.SMTP('localhost')
    smtp.sendmail(email_from, user_email, msg.as_string())
    smtp.close()


def email_wallet(user_email, wallet, uuid):
  if user_email is not None:
    msg = MIMEMultipart('alternative')
    msg['From'] = email_from
    msg['To'] = user_email
    msg['Subject'] = "Omniwallet Backup File"

    text = ('Omniwallet Backup File\n'
            'This email contains an encrypted back of your wallet files. \n'
            'With this file you can import your wallet into any server running the Omniwallet software\n'
            'Be sure to keep this safe and stored seperately from your password\n\n'
            'Wallet Id: '+str(uuid)+'\n'
            'Login Link: https://'+str(email_domain)+'/login/'+str(uuid)+'\n\n\n'
            'Do not Forget Your Password!\n'
            'WARNING: Forgotten passwords are UNRECOVERABLE and will results in LOSS of ALL of your coins!' )

    html = ('<html><head></head>'
            '<img src="https://'+str(email_domain)+'/assets/img/logo.png"><h2>Omniwallet Backup File</h2>'
            '<body><p>'
            'This email contains an encrypted back of your wallet files.<br>'
            'With this file you can import your wallet into any server running the Omniwallet software.<br>'
            'Be sure to keep this safe and stored seperately from your password<br><br>'
            '<b>Wallet Id:</b> '+str(uuid)+'<br>'
            '<b>Login Link:</b> <a href="https://'+str(email_domain)+'/login/'+str(uuid)+'">https://'+str(email_domain)+'/login/'+str(uuid)+'</a><br><br><br>'
            '<h3>Do not Forget Your Password!</h3><br>'
            '<b>WARNING:</b> Forgotten passwords are UNRECOVERABLE and will results in LOSS of ALL funds in your wallet not backed up!<br>'
            '</p></body></html>'  )

    part1 = MIMEText(text, 'plain')
    part2 = MIMEText(html, 'html')
    msg.attach(part1)
    msg.attach(part2)

    wfile = MIMEBase('application', 'octet-stream')
    wfile.set_payload(wallet)
    Encoders.encode_base64(wfile)
    wfile.add_header('Content-Disposition', 'attachment', filename=uuid+'.json')
    msg.attach(wfile)
    smtp = smtplib.SMTP('localhost')
    smtp.sendmail(email_from, user_email, msg.as_string())
    smtp.close()



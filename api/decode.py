from flask import Flask, abort, json, jsonify
import hashlib
import pybitcointools
import decimal
from rpcclient import *

app = Flask(__name__)
app.debug = True

@app.route('/<rawhex>')
def decode_handler(rawhex):
  return jsonify(decode(rawhex))


def getinputs(rawtx):
  retval={'invalid':False, 'inputs':{}}
  for input in rawtx['vin']:
      prevtx=getrawtransaction(input['txid'])
      if prevtx['result']['vout'][input['vout']]['scriptPubKey']['type'] not in ['pubkeyhash','scripthash']:
        #Valid MP tx's only have pubkeyhash and scripthash as inputs
        retval['invalid']=True
      inputamount= int(decimal.Decimal(str( prevtx['result']['vout'][input['vout']]['value']))*decimal.Decimal(1e8))
      for addr in prevtx['result']['vout'][input['vout']]['scriptPubKey']['addresses']:
        if addr in retval['inputs']:
          retval['inputs'][addr] += inputamount
        else:
          retval['inputs'][addr] = inputamount
  return retval
  

def decode(rawhex):

  rawBTC = decoderawtransaction(rawhex)['result']
  inputs = getinputs(rawBTC)['inputs']

  try:
    rawOMNI = omni_decodetransaction(rawhex)
    rawOMNI = rawOMNI['result']
    sender  = rawOMNI['sendingaddress']
    try:
      reference = rawOMNI['referenceaddress']
    except:
      reference = ""
  except Exception as e:
    rawOMNI=e.message
    sia=0
    sender=""
    reference=""
    for s in inputs:
      if inputs[s] > sia:
        sender = s
        sia = inputs[s]
        print sia

  if sender == "":
    error = "Can\'t decode MP TX. No valid sending address found."
  else:
    error = "None"

  print {'Sender':sender,'Reference':reference,'BTC':rawBTC, 'MP':rawOMNI,'inputs':inputs, 'error':error}
  return {'Sender':sender,'Reference':reference,'BTC':rawBTC, 'MP':rawOMNI,'inputs':inputs, 'error':error}

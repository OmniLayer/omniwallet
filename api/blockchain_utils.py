import simplejson
import requests
import decimal
import json, re
from rpcclient import gettxout
from cacher import *
import config

try:
  expTime=config.BTCBAL_CACHE
except:
  expTime=600

try:
  TESTNET = config.TESTNET
except:
  TESTNET = False

if TESTNET:
  # neither blockchain.info nor blockonomics support testnet
  BLOCKCHAININFO_API_URL = "https://blockchain.info"
  BLOCKONOMICS_API_URL = "https://www.blockonomics.co/api"

  BLOCKTRAIL_API_URL = "https://api.blocktrail.com/v1/tbtc"
  BLOCKCYPHER_API_URL = "https://api.blockcypher.com/v1/btc/test3"
  BITGO_API_URL = "https://test.bitgo.com/api/v1"
  BTCCOM_API_URL = "https://chain.api.btc.com/v3"
else:
  BLOCKCHAININFO_API_URL = "https://blockchain.info"
  BLOCKTRAIL_API_URL = "https://api.blocktrail.com/v1/btc"
  BLOCKCYPHER_API_URL = "https://api.blockcypher.com/v1/btc/main"
  BITGO_API_URL = "https://www.bitgo.com/api/v1"
  BTCCOM_API_URL = "https://tchain.api.btc.com/v3"
  BLOCKONOMICS_API_URL = "https://www.blockonomics.co/api"


def bc_getutxo(address, ramount):
  try:
    r = requests.get(BLOCKCHAININFO_API_URL + '/unspent?active='+address)
    if r.status_code == 200:
      avail=0
      retval=[]
      response = r.json()
      unspents = response['unspent_outputs']
      print "got unspent list (blockchain)", response
      for tx in sorted(unspents, key = lambda i: i['value'],reverse=True):
        txUsed=gettxout(tx['tx_hash_big_endian'],tx['tx_output_n'])['result']
        isUsed = txUsed==None
        if not isUsed:
          coinbaseHold = (txUsed['coinbase'] and txUsed['confirmations'] < 100)
          multisigSkip = ("scriptPubKey" in txUsed and txUsed['scriptPubKey']['type'] == "multisig")
          if not coinbaseHold and txUsed['confirmations'] > 0 and not multisigSkip:
            avail += tx['value']
            retval.append([ tx['tx_hash_big_endian'], tx['tx_output_n'], tx['value'] ])
            if avail >= ramount:
              return {"avail": avail, "utxos": retval, "error": "none"}
      if ('notice' in response and 'Ignoring' in response['notice']):
        return bc_getutxo_btccom(address, ramount)
      else:
        return {"avail": avail, "error": "Low balance error"}
    else:
      return bc_getutxo_btccom(address, ramount)
  except:
    return bc_getutxo_btccom(address, ramount)


def bc_getutxo_btccom(address, ramount, page=1, retval=None, avail=0):
  if retval==None:
    retval=[]
  try:
    r = requests.get(BTCCOM_API_URL + '/address/'+address+'/unspent?pagesize=50&page='+str(page), timeout=2)
    if r.status_code == 200:
      response = r.json()['data']
      unspents = response['list']
      print "got unspent list (btc)", response
      for tx in unspents:
        txUsed=gettxout(tx['tx_hash'],tx['tx_output_n'])['result']
        isUsed = txUsed==None
        coinbaseHold = (txUsed['coinbase'] and txUsed['confirmations'] < 100)
        multisigSkip = ("scriptPubKey" in txUsed and txUsed['scriptPubKey']['type'] == "multisig")
        if not isUsed and not coinbaseHold and txUsed['confirmations'] > 0 and not multisigSkip:
          avail += tx['value']
          retval.append([ tx['tx_hash'], tx['tx_output_n'], tx['value'] ])
          if avail >= ramount:
            return {"avail": avail, "utxos": retval, "error": "none"}
      if int(response['total_count'])-(int(response['pagesize'])*page ) > 0:
        return bc_getutxo(address, ramount, page+1, retval, avail)
      return {"avail": avail, "error": "Low balance error"}
    else:
      return bc_getutxo_blockcypher(address, ramount)
  except:
    return bc_getutxo_blockcypher(address, ramount)

def bc_getutxo_blockcypher(address, ramount):
  try:
    r = requests.get(BLOCKCYPHER_API_URL + '/addrs/'+address+'?unspentOnly=true', timeout=2)
    if r.status_code == 200:
      try:
        unspents = r.json()['txrefs']
      except Exception as e:
        print "no txrefs in bcypher json response"
        unspents = []
      print "got unspent list (bcypher)", unspents

      retval = []
      avail = 0
      for tx in unspents:
        txUsed=gettxout(tx['tx_hash'],tx['tx_output_n'])
        isUsed = ('result' in txUsed and txUsed['result']==None)
        if tx['confirmations'] > 0 and not isUsed:
          avail += tx['value']
          retval.append([ tx['tx_hash'], tx['tx_output_n'], tx['value'] ])
          if avail >= ramount:
            return {"avail": avail, "utxos": retval, "error": "none"}
      return {"avail": avail, "error": "Low balance error"}
    else:
      return {"error": "Connection error", "code": r.status_code}
  except Exception as e:
    if 'call' in e.message:
      msg=e.message.split("call: ")[1]
      ret=re.findall('{.+',str(msg))
      try:
        msg=json.loads(ret[0])
      except TypeError:
        msg=ret[0]
      except ValueError:
        #reverse the single/double quotes and strip leading u in output to make it json compatible
        msg=json.loads(ret[0].replace("'",'"').replace('u"','"'))
      return {"error": "Connection error", "code": msg['message']}
    else: 
      return {"error": "Connection error", "code": e.message}


def bc_getpubkey(address):
  try:
    r = requests.get(BLOCKCHAININFO_API_URL + '/q/pubkeyaddr/'+address)

    if r.status_code == 200:
      return str(r.text)
    else:
      return "error"
  except:
    return "error"

def bc_getbalance(address):
  try:
    balance=rGet("omniwallet:balances:address:"+str(address))
    balance=json.loads(balance)
    if balance['error']:
      raise LookupError("Not cached")
  except Exception as e:
    balance = bc_getbalance_bitgo(address)
    #cache btc balance for 2.5 minutes
    rSet("omniwallet:balances:address:"+str(address),json.dumps(balance))
    rExpire("omniwallet:balances:address:"+str(address),expTime)
  return balance

def bc_getbalance_bitgo(address):
  try:
    r= requests.get(BITGO_API_URL + '/address/'+address, timeout=2)
    if r.status_code == 200:
      #balance = int(r.json()['confirmedBalance'])
      rt = r.json()
      balance = int(rt['spendableBalance'])
      pending = int(rt['unconfirmedReceives'])
      return {"bal":balance, "pending": pending, "error": None}
    else:
      return bc_getbalance_blockcypher(address)
  except:
    return bc_getbalance_blockcypher(address)

def bc_getbalance_blockcypher(address):
  try:
    r= requests.get(BLOCKCYPHER_API_URL + '/addrs/'+address+'/balance', timeout=2)
    if r.status_code == 200:
      balance = int(r.json()['balance'])
      return {"bal":balance , "error": None}
    else:
      return {"bal": 0 , "error": "Couldn't get balance"}
  except:
    return {"bal": 0 , "error": "Couldn't get balance"}

def bc_getbulkbalance(addresses):
  split=[]
  recurse=[]
  counter=0
  retval={}
  cbdata={}
  for a in addresses:
    try:
      cb=rGet("omniwallet:balances:address:"+str(a))
      cb=json.loads(cb)
      if cb['error']:
        raise LookupError("Not cached")
      else:
        cbdata[a]=cb['bal']
    except Exception as e:
      if counter < 20:
        split.append(a)
      else:
        recurse.append(a)
      counter+=1

  if len(split)==0:
    if len(cbdata) > 0:
      retval={'bal':cbdata, 'fresh':None}
    else:
      retval={'bal':{}, 'fresh':None}
  else:
    if TESTNET:
      try:
        data=bc_getbulkbalance_btccom(split)
        if data['error']:
          raise Exception("issue getting btccom baldata","data",data,"split",split)
        else:
          retval={'bal':dict(data['bal'],**cbdata), 'fresh':split}
      except Exception as e:
        print e
        if len(cbdata) > 0:
          retval={'bal':cbdata, 'fresh':None}
        else:
          retval={'bal':{}, 'fresh':None}
    else:
      try:
        data=bc_getbulkbalance_blockonomics(split)
        if data['error']:
          raise Exception("issue getting blockonomics baldata",data)
        else:
          retval={'bal':dict(data['bal'],**cbdata), 'fresh':split}
      except Exception as e:
        print e
        try:
          data=bc_getbulkbalance_blockchain(split)
          if data['error']:
            raise Exception("issue getting blockchain baldata",data)
          else:
            retval={'bal':dict(data['bal'],**cbdata), 'fresh':split}
        except Exception as e:
          print e
          if len(cbdata) > 0:
            retval={'bal':cbdata, 'fresh':None}
          else:
            retval={'bal':{}, 'fresh':None}

  rSetNotUpdateBTC(retval)
  if len(recurse)>0:
    rdata=bc_getbulkbalance(recurse)
  else:
    rdata={}
  return dict(retval['bal'],**rdata)

      
def bc_getbulkbalance_blockonomics(addresses):
  formatted=""
  for address in addresses:
    if formatted=="":
      formatted=address
    else:
      formatted=formatted+" "+address

  try:
    r = requests.post(BLOCKONOMICS_API_URL + '/balance',json.dumps({"addr":formatted}))
    if r.status_code == 200:
      balances = r.json()['response']
      retval = {}
      for entry in balances:
        retval[entry['addr']] = int(entry['confirmed'])+int(entry['unconfirmed'])
      return {"bal": retval, "error": None}
    else:
      return {"bal": None , "error": True}
  except:
    return {"bal": None , "error": True}

def bc_getbulkbalance_blockchain(addresses):
  formatted=""
  for address in addresses:
    if formatted=="":
      formatted=address
    else:
      formatted=formatted+"|"+address
  try:
    r= requests.get(BLOCKCHAININFO_API_URL + '/balance?active='+formatted)
    if r.status_code == 200:
      balances = r.json()
      retval = {}
      for entry in balances:
        retval[entry] = int(balances[entry]['final_balance'])
      return {"bal": retval, "error": None}
    else:
      return {"bal": None , "error": True}
  except:
    return {"bal": None , "error": True}

def bc_getbulkbalance_btccom(addresses):
  formatted=""
  for address in addresses:
    if formatted=="":
      formatted=address
    else:
      formatted=formatted+","+address
  try:
    r = requests.get(BTCCOM_API_URL + '/address/'+formatted, timeout=2)
    if r.status_code == 200:
      balances = r.json()
      retval = {}
      for entry in balances["data"]:
        retval[entry["address"]] = int(entry['balance'])
      return {"bal": retval, "error": None}
    else:
      return {"bal": None , "error": True}
  except Exception as e:
    print_debug(("error getting btccom bulk",e),4)
    return {"bal": None , "error": True}

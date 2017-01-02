import simplejson
import requests
import decimal
import json
from rpcclient import gettxout

def bc_getutxo(address, ramount):
  try:
    r = requests.get('https://api.blockcypher.com/v1/btc/main/addrs/'+address+'?unspentOnly=true')

    if r.status_code == 200:
      unspents = r.json()['txrefs']
      print "got unspent list", unspents

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
      #return {"error": "Connection error", "code": r.status_code}
      return bc_getutxo_blockr(address, ramount)
  except:
    return bc_getutxo_blockr(address, ramount)

def bc_getutxo_blockr(address, ramount):
  try:
    r = requests.get('http://btc.blockr.io/api/v1/address/unspent/'+address+'?unconfirmed=1')

    if r.status_code == 200:
      #Process and format response from blockr.io

      unspents = r.json()['data']['unspent']

      print "blockcypher failed, blockr unspents", unspents
      retval = []
      avail = 0
      for tx in unspents:
        txUsed=gettxout(tx['tx'],tx['n'])
        isUsed = ('result' in txUsed and txUsed['result']==None)
        if tx['confirmations'] > 0 and not isUsed:
          tx['amount'] =  int(decimal.Decimal(tx['amount'])*decimal.Decimal(1e8))
          avail += tx['amount']
          retval.append([ tx['tx'], tx['n'], tx['amount'] ])
          if avail >= ramount:
            return {"avail": avail, "utxos": retval, "error": "none"}
      return {"avail": avail, "error": "Low balance error"}
    else:
      return {"error": "Connection error", "code": r.status_code}
  except:
    return {"error": "Connection error", "code": r.status_code}


def bc_getpubkey(address):
  try:
    r = requests.get('https://blockchain.info/q/pubkeyaddr/'+address)

    if r.status_code == 200:
      return str(r.text)
    else:
      return "error"
  except:
    return "error"

def bc_getbalance(address):
  try:
    r= requests.get('https://api.blockcypher.com/v1/btc/main/addrs/'+address+'/balance')
    if r.status_code == 200:
      balance = int(r.json()['balance'])
      return {"bal":balance , "error": None}
    else:
      return bc_getbalance_blockr(address)
  except:
    return bc_getbalance_blockr(address)

def bc_getbalance_blockr(address):
  try:
    r= requests.get('http://btc.blockr.io/api/v1/address/balance/'+address)
    if r.status_code == 200:
      balance = int(r.json()['data']['balance']*1e8)
      return {"bal":balance , "error": None}
    else:
      return {"bal": 0 , "error": "Couldn't get balance"}
  except:
      return {"bal": 0 , "error": "Couldn't get balance"}

def bc_getbulkbalance(addresses):
  try:
    #get bulk data from blockonomics
    list=""
    for a in addresses:
      if list == "":
        list = a
      else:
        list += " "+a

    baldata=bc_getbulkbalance_blockonomics(list)
    if not baldata['error']:
      return baldata['bal']
    else:
      #if blockonomics lookup fails get from blockr
      list=""
      counter=0
      total=0
      btclist={}
      for a in addresses:
        if list == "":
          list = a
        else:
          list += ","+a
        counter+=1
        total+=1
        if counter>=19 or total==len(addresses):
          baldata=bc_getbulkbalance_blockr(list)
          counter=0
          list=""
          try:
            for addr in baldata['bal']:
              btclist[addr]=baldata['bal'][addr]
          except TypeError:
            print "No Data:",baldata
      return btclist
  except Exception as e:
    print "Error getting bulk data"+str(e)


      
def bc_getbulkbalance_blockonomics(addresses):
  try:
    r = requests.post('https://www.blockonomics.co/api/balance',json.dumps({"addr":addresses}))
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

def bc_getbulkbalance_blockr(addresses):
  try:
    r= requests.get('http://btc.blockr.io/api/v1/address/balance/'+addresses)
    if r.status_code == 200:
      balances = r.json()['data']
      retval = {}
      for entry in balances:
        retval[entry['address']] = int(entry['balance']*1e8)
      return {"bal": retval, "error": None}
    else:
      return {"bal": None , "error": True}
  except:
    return {"bal": None , "error": True}



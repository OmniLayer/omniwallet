import simplejson
import requests
import decimal


def bc_getutxo(address, ramount):
  r = requests.get('http://btc.blockr.io/api/v1/address/unspent/'+address+'?unconfirmed=2')

  if r.status_code == 200:
    #Process and format response from blockr.io

    unspents = r.json()['data']['unspent']

    retval = []
    avail = 0
    for tx in unspents:
      if tx['confirmations'] > 2:
        tx['amount'] =  int(decimal.Decimal(tx['amount'])*decimal.Decimal(1e8))
        avail += tx['amount']
        retval.append([ tx['tx'], tx['n'], tx['amount'] ])
        if avail >= ramount:
          return {"avail": avail, "utxos": retval, "error": "none"}
    return {"avail": avail, "error": "Low balance error"}
  else:
    return {"error": "Connection error", "code": r.status_code}


def bc_getpubkey(address):
  r = requests.get('https://blockchain.info/q/pubkeyaddr/'+address)

  if r.status_code == 200:
    return str(r.text)
  else:
    return "error"

def bc_getbalance(address):
  r= requests.get('http://btc.blockr.io/api/v1/address/balance/'+address)
  if r.status_code == 200:
    balance = int(r.json()['data']['balance']*1e8)
    return {"bal":balance , "error": None}
  else:
    return {"bal": 0 , "error": "Couldn't get balance"}

def bc_getbulkbalance(addresses):
  r= requests.get('http://btc.blockr.io/api/v1/address/balance/'+addresses)
  if r.status_code == 200:
    balances = r.json()['data']
    retval = {}
    for entry in balances:
      retval[entry['address']] = int(entry['balance']*1e8)

    return {"bal": retval, "error": None}
  else:
    return {"bal": None , "error": "Couldn't get balance"}



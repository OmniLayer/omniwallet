import simplejson
import requests
import decimal


def bc_getutxo(address, ramount):
  r = requests.get('http://btc.blockr.io/api/v1/address/unspent/'+address)

  if r.status_code == 200:
    #Process and format response from blockr.io

    unspents = r.json()['data']['unspent']

    retval = []
    avail = 0
    for tx in unspents:
      tx['amount'] =  int(decimal.Decimal(tx['amount'])*decimal.Decimal(1e8))
      avail += tx['amount']
      retval.append([ tx['tx'], tx['n'], tx['amount'] ])
      if avail >= ramount:
        return {"avail": avail, "utxos": retval, "error": "none"}
    return {"avail": avail, "error": "Low balance error"}
  else:
    return {"error": "Connection error", "code": r.status_code}

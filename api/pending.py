from decode import *
from sqltools import *

def insertpending(txhex):

  try:
    rawtx = decode(txhex)
  except Exception,e:
    print "Error: ", e, "\n Could not decode PendingTx: ", txhex
    return

  if 'BTC' in rawtx:
    #handle btc pending amounts
    insertbtc(rawtx)

  if 'Amount' in rawtx['MP'] and rawtx['MP']['Amount']>0:
    #only run if we have a non zero positive amount to process, otherwise exit
    insertmsc(rawtx)

def insertbtc(rawtx):
  try:
    sender = rawtx['Sender']
    receiver = rawtx['Receiver']
    propertyid = 0
    txtype = 0
    txversion = rawtx['BTC']['version']
    txhash = rawtx['BTC']['txid']
    protocol = "Bitcoin"
    txdbserialnum = dbSelect("select least(-1,min(txdbserialnum)) from transactions;")[0][0]
    txdbserialnum -= 1
    addresstxindex = 0
    inputamount = -int(decimal.Decimal(str(rawtx['BTC']['inputBTC']))*decimal.Decimal(1e8))

    dbExecute("insert into transactions (txhash,protocol,txdbserialnum,txtype,txversion) values(%s,%s,%s,%s,%s)",
              (txhash,protocol,txdbserialnum,txtype,txversion))

    address=sender
    addressrole="sender"
    #insert the addressesintxs entry for the sender
    dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
              "values(%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,inputamount))

    addressrole="recipient"
    for output in rawtx['BTC']['vout']:
      outputamount = int(decimal.Decimal(str(output['value']))*decimal.Decimal(1e8))
      for addr in output['scriptPubKey']['addresses']:
         address=addr
         dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
                   "values(%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,inputamount))
      addresstxindex+=1
    dbCommit()
  except Exception,e:
    print "Error: ", e, "\n Could not add BTC PendingTx: ", rawtx
    dbRollback()  

def insertmsc(rawtx):
  try:
    sender = rawtx['Sender']
    receiver = rawtx['Receiver']
    propertyid = rawtx['MP']['PropertyID']
    txtype = rawtx['MP']['TxType']
    txversion = rawtx['MP']['TxVersion']
    txhash = rawtx['BTC']['txid']
    protocol = "Mastercoin"
    addresstxindex=0
    txdbserialnum = dbSelect("select least(-1,min(txdbserialnum)) from transactions;")[0][0]
    txdbserialnum -= 1
    amount = rawtx['MP']['Amount']

    if txtype == 55:
      #handle grants to ourself or others
      if receiver == "":
        sendamount=amount
        recvamount=0
      else:
        sendamount=0
        recvamount=amount
    else:
      #all other txs deduct from our balance and, where applicable, apply to the reciever
      sendamount=-amount
      recvamount=amount  

    dbExecute("insert into transactions (txhash,protocol,txdbserialnum,txtype,txversion) values(%s,%s,%s,%s,%s)",
              (txhash,protocol,txdbserialnum,txtype,txversion))
    
    address=sender
    addressrole="sender"
    #insert the addressesintxs entry for the sender
    dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
              "values(%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,sendamount))

    #update pending balance
    #dbExecute("update addressbalances set balancepending=balancepending+%s::numeric where address=%s and propertyid=%s and protocol=%s", (sendamount,address,propertyid,protocol))

    if receiver != "":
      address=receiver
      addressrole="recipient"
      dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
                "values(%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,recvamount))
      #update pending balance
      #dbExecute("update addressbalances set balancepending=balancepending+%s::numeric where address=%s and propertyid=%s and protocol=%s", (recvamount,address,propertyid,protocol))
    dbCommit()
  except Exception,e:
    print "Error: ", e, "\n Could not add MSC PendingTx: ", rawtx
    dbRollback()


from decode import *
from sqltools import *

def insertpending(txhex):

  rawtx = decode(txhex)
  if 'Amount' not in rawtx['MP'] or rawtx['MP']['Amount']<=0:
    #only run if we have a non zero positive amount to process, otherwise exit
    return

  try:
    sender = rawtx['Sender']
    receiver = rawtx['Receiver']
    propertyid = rawtx['MP']['PropertyID']
    txtype = rawtx['MP']['TxType']
    txversion = rawtx['MP']['TxVersion']
    txhash = rawtx['BTC']['txid']
    protocol = "Mastercoin"
    addresstxindex=0
    txdbserialnum = dbSelect("select least(-1,min(txdbserialnum)) from transactions;")
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
              "values(%s,%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,sendamount))

    #update pending balance
    dbExecute("update addressbalances set balancepending=balancepending+%s::numeric where address=%s and propertyid=%s and protocol=%s", (sendamount,address,protocol))

    if receiver != "":
      address=receiver
      addressrole="receiver"
      dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
                "values(%s,%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,recvamount))
      #update pending balance
      dbExecute("update addressbalances set balancepending=balancepending+%s::numeric where address=%s and propertyid=%s and protocol=%s", (recvamount,address,protocol))
    dbCommit()
  except Exception,e:
    print "Error: ", e "\n Could not add PendingTx: ", txhex
    dbRollback()


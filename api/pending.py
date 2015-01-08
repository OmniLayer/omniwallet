from decode import *
from sqltools import *

def insertpending(txhex):

  rawtx = decode(txhex)
  if 'Amount' not in rawtx['MP'] and rawtx['MP']['Amount']<=0:
    #only run if we have a non zero positive amount to process, otherwise exit
    return

  sender = rawtx['Sender']
  reciever = rawtx['Reciever']
  propertyid = rawtx['MP']['PropertyID']
  txtype = rawtx['MP']['TxType']
  txversion = rawtx['MP']['TxVersion']
  txhash = rawtx['BTC']['txid']
  amount = rawtx['MP']['Amount']
  protocol = "Mastercoin"

  txdbserialnum = dbSelect("select least(-1,min(txdbserialnum)) from transactions;")
  txdbserialnum -=1
  

  dbExecute("insert into transactions (txhash,protocol,txdbserialnum,txtype,txversion) values(%s,%s,%s,%s,%s)",
            (txhash,protocol,txdbserialnum,txtype,txversion))
    
  address=sender
  addressrole="sender"
  #insert the addressesintxs entry for the sender
  dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
            "values(%s,%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,-amount))

  #update pending balance
  dbExecute("update addressbalances set balancepending=balancepending-%s where address=%s and propertyid=%s and protocol=%s", (amount,address,protocol))

  if reciever != "":
    address=reciever
    addressrole="reciever"
    dbExecute("insert into addressesintxs (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,balanceavailablecreditdebit) "
              "values(%s,%s,%s,%s,%s,%s,%s,%s)", (address,propertyid,protocol,txdbserialnum,addresstxindex,addressrole,amount))
    #update pending balance
    dbExecute("update addressbalances set balancepending=balancepending+%s where address=%s and propertyid=%s and protocol=%s", (amount,address,protocol))



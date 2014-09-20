import urlparse
import os, sys, re
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *
import psycopg2, psycopg2.extras
from decimal import Decimal

sqlconn = sql_connect()

app = Flask(__name__)
app.debug = True

@app.route('/tx/<hash_id>')
def gettransaction(hash_id):
    try:
        transaction_ = str(re.sub(r'\W+', '', hash_id.split('.')[0] ) ) #check alphanumeric
    except ValueError:
        abort(make_response('This endpoint only consumes valid input', 400))

    sqlconn.execute("select * from transactions t, txjson txj where t.txdbserialnum = txj.txdbserialnum and t.txhash=\'" + str(transaction_) + "\'")
    ROWS= sqlconn.fetchall()

    if len(ROWS) < 1:
      return json.dumps([])

    def dehexify(hex_str):
        temp_str=[]
        for let in hex_str:
            if ord(let) < 128:
                temp_str.append(let)
            else:
                temp_str.append('?')
        return ''.join(temp_str)
                 
    txJson = ROWS[0][-1]
    txData = ROWS[0][:-1]

    txType = ROWS[0][3]
    txValid = True if ROWS[0][7] == 'valid' else False

    #  0 - Simple send
    # 56 - Revoke Property Tokens
    # 55 - Grant Property Tokens
    # 53 - Close crowdsale
    # -1 - invalid tx
    # 21 - Metadex - TODO
    #  3 - Send to Owners - TODO

    ret = { 
      "block": txData[9],
      "ecosystem": '1' if txData[5] == 'Production' else '2', 
      "from_address": txJson['sendingaddress'], 
      "transactionType": txData[3], 
      "transactionVersion": txData[4],
      "confirms": txJson['confirmations'],
      "tx_hash": txData[0], 
      "tx_time": str(txJson['blocktime']) + '000',
    }

    if txType != -22: #Dex purchases don't have these fields 
      ret['currencyId'] = txJson['propertyid']
      ret['currency_str'] = 'Mastercoin' if txJson['propertyid'] == 1 else 'Test Mastercoin' if txJson['propertyid'] == 2 else "Smart Property"
      ret['invalid'] = False if txJson['valid'] == True else True
      ret['amount'] = txJson['amount']
      ret['formatted_amount'] = txJson['amount']
      ret['divisible'] = txJson['divisible']
      ret['fee'] = txJson['fee']
      ret['tx_type_str'] = txJson['type']

    if (txType == 50 or txType == 51 or txType == 54) and txValid:

      # 50 - Create property fixed - propertyname (getproperty), category, totaltokens, url, data, subcategory
      # 51 - Create property Variable - propertyname, (getproperty) , tokensperunit, subcategory, totaltokens, deadline, 
      # category, amountraised, closedearly, propertyiddesired, maxtokens, percenttoissuer, earlybonus, active, data, url,  tokensissued, starttime
      # 54 - Create Property Manual - propertyname, (getgrants), category, totaltokens, url, [issuances], subcategory, data
      
      sqlconn.execute("select * from transactions t, smartproperties sp where t.txhash=\'" + str(transaction_) + "\' and t.txdbserialnum = sp.createtxdbserialnum")
      ROWS= sqlconn.fetchall()
      mpData = ROWS[0][-1]

      ret['previous_property_id'] = "(null)" #TODO FIXME

      ret['propertyName'] = dehexify( mpData['name'] )
      ret['propertyCategory'] = dehexify( mpData['category'] )
      ret['propertyData'] = dehexify( mpData['data'] )
      ret['propertySubcategory'] = dehexify( mpData['subcategory'] )
      ret['propertyUrl'] = dehexify( mpData['url'] )
      
      ret['propertyType'] = '0002' if mpData['divisible'] == True else '0001' 
      ret['formatted_property_type'] = int('0002' if mpData['divisible'] == True else '0001')

      if txType == 50 or txType == 54: ret['numberOfProperties'] = mpData['totaltokens']; 
      
      if txType == 51:
        ret['numberOfProperties'] = mpData['tokensperunit']; 
        ret['currencyIdentifierDesired'] = mpData['propertyiddesired']
        ret['deadline'] = mpData['deadline']
        ret['earlybirdBonus'] = mpData['earlybonus']
        ret['percentageForIssuer'] = mpData['percenttoissuer']

      if txType == 54: ret['issuances'] = mpData['issuances']


    if (txType == 20 or txType == 22) and txValid:

      # 20 - Dex Sell - subaction, bitcoindesired, timelimit
      # 22 - Dex Accepts - referenceaddress 
    
      if txType == 20:
        sqlconn.execute("select * from transactions t, activeoffers ao, txjson txj where t.txhash=\'" + str(transaction_) + "\' and t.txdbserialnum = ao.createtxdbserialnum and t.txdbserialnum=txj.txdbserialnum")
        ROWS= sqlconn.fetchall()
        row = ROWS[0]
        mpData = ROWS[0][-1]

        ppc = Decimal( mpData['bitcoindesired'] ) / Decimal( mpData['amount'] )
        ret['amount_available'] = str(row[12])
        ret['formatted_amount_available'] = '%.8f' % ( Decimal(row[12]) / Decimal(1e8) )
        ret['bitcoin_amount_desired'] = str(row[13])
        ret['formatted_bitcoin_amount_desired'] = '%.8f' % ( Decimal(row[13]) / Decimal(1e8) )
        ret['formatted_block_time_limit'] = str(mpData['timelimit'])
        ret['formatted_fee_required'] = str(mpData['feerequired'])
        ret['formatted_price_per_coin'] = '%.8f' % ppc
        ret['bitcoin_required'] = '%.8f' % ( Decimal( ppc ) * Decimal( mpData['amount'] ) )
        ret['subaction'] = mpData['subaction']

      if txType == 22:
        sqlconn.execute("select * from transactions t, offeraccepts oa, txjson txj where t.txhash=\'" + str(transaction_) + "\' and t.txdbserialnum = oa.linkedtxdbserialnum and t.txdbserialnum=txj.txdbserialnum")
        ROWS= sqlconn.fetchall()
        mpData = ROWS[0][-1]

        ret['to_address'] = mpData['referenceaddress']

    if (txType == -51 or txType -22) and txValid:

        #-51 - Crowdsale Purchase - purchasedpropertyid, referenceaddress, purchasedpropertydivisible, purchasedpropertyname, purchasedtokens, issuertokens, (getcrowdsale)
        #-22 - Dex Purchase - [ purchases ] 

      if txType == -22:
        ret['purchases'] = txJson['purchases']
        ret['currencyId'] = '0'
        ret['currency_str'] = 'Bitcoin'

      if txType == -51:
        ret['purchasepropertyid'] = txJson['purchasedpropertyid']
        ret['to_address'] = txJson['referenceaddress']
        ret['purchaedpropertydivisible'] = txJson['purchasedpropertydivisible']
        ret['purchasedpropertyname'] = txJson['purchasedpropertyname']
        ret['purchasedtokens'] = txJson['purchasedtokens']
        ret['issuertokens'] = txJson['issuertokens']

    return json.dumps([ ret ] , sort_keys=True, indent=4) #only send back mapped schema 

@app.route('/general/<page_id>')
def getmostrecent(page_id):
    return 0

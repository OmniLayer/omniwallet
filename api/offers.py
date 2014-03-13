import urlparse
import os, sys
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *
import tempfile

data_dir_root = os.environ.get('DATADIR')

def offers_response(response_dict):
    expected_fields=['type','currencyType']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
    
    #DEBUG print response_dict        
    if response_dict['type'][0].upper() == "TRANSACTIONBID":
        data = filterTransactionBid(response_dict['transaction'][0], response_dict['validityStatus'][0].upper() )
    elif response_dict['type'][0].upper() == "TRANSACTION":
        data = filterTransaction(response_dict['transaction'][0] )
    elif response_dict['type'][0].upper() == "TIME":
        if 'time' in response_dict:
            time = int(response_dict['time'][0])
        else:
            time = 86400
        data = filterOffersByTime( response_dict , time  )
    else:
        data = filterOffers(response_dict['address'][0],response_dict['currencyType'][0].upper(), response_dict['offerType'][0].upper())    
    
    response_status='OK'
    response='{"status":"'+response_status+'", "data":'+ str(json.dumps(data)) +'}'
    
    #DEBUG print response
    return (response, None)

def filterOffersByTime( request_data , time_seconds=86400):
    import glob
    import time

    ct = request_data['currencyType']
    ot = request_data['orderType'][0] if request_data.has_key('orderType') else 'OFFER'

    otLookup = { 'OFFER': 'Sell offer', 'ACCEPT': 'Sell accept' }
    #for each file in /tx
    #    extract timestamp
    #    compare it to within the time given
    #    make sure its a sell offer
    #    if so, add to array
    #    pass back array

    #filter by currency
    #if currencytype != 'MSC':
    #    currency = '0'
    #else:
    #    currency = '1'
    #del allOffers[currency]

    atleast_now = int( str( int(time.time() - time_seconds) ) + '000'  )
    transactions = glob.glob(data_dir_root + '/www/tx/*')

    transaction_data = []
    for transaction in transactions:
        if transaction[-5:] == '.json':
          with open( transaction , 'r' ) as f:
            tx = json.loads(f.readline())[0]

            if tx['invalid'] == False:
                if int(tx['tx_time']) >= (atleast_now-time_seconds):
                    if str(tx['tx_type_str']) == otLookup[ot]:
                        #info(['tx time ', time.ctime( int(str( tx['tx_time'] )[:-3]) ) ])
                        #info(['now time - time_s ', time.ctime( int(str(atleast_now-time_seconds)[:-3]) ) ])
                        transaction_data.append(tx)
    return transaction_data

def filterOffers(address,currencytype, offertype):
    # currencyType   =  TMSC or MSC
    # offerType      =  SELL, ACCEPT or BOTH
    
    #get list of all offers by address
    try:
        datadir = data_dir_root + '/addr'
        filepath =  datadir + '/' + address + '.json'
        f=open( filepath , 'r' )
        allOffers = json.loads(f.readline())
    except IOError:
        return 'ADDRESS_NOT_FOUND'
    
    #filter by currency
    #1 is TMSC 
    #0 is MSC
    if currencytype != 'MSC':
        currency = '0'
    else:
        currency = '1'
    del allOffers[currency]
    
    #filter by offer type
    #accept_tx are offers accepted
    #bought_tx are offers bought
    #offer_tx are offers of sale
    #sold_tx are offers sold
    #recieved and sent tx are simple send
    #exodus tx is not related to offers
        
    offerstruct = {}
    for key in allOffers:
        if isinstance(allOffers[key],dict):
            if offertype == 'BOTH':
                offerstruct['accept_tx'] = allOffers[key]['accept_transactions']
                offerstruct['bought_tx'] = allOffers[key]['bought_transactions']
                offerstruct['offer_tx'] = allOffers[key]['offer_transactions']
                offerstruct['sold_tx'] = allOffers[key]['sold_transactions']
                return offerstruct
            elif offertype == 'ACCEPT': #accept_tx
                offerstruct['accept_tx'] = allOffers[key]['accept_transactions']
                offerstruct['bought_tx'] = allOffers[key]['bought_transactions']
                return offerstruct
            elif offertype == 'SELL': #offer_tx
                offerstruct['offer_tx'] = allOffers[key]['offer_transactions']
                offerstruct['sold_tx'] = allOffers[key]['sold_transactions']
                return offerstruct

def filterTransactionBid(transaction,validitystatus):
    # validityStatus =  VALID, INVALID, EXPIRED or ANY
    
    #get transaction data
    try:
        datadir = data_dir_root + '/bids'
        filepath =  datadir + '/bids-' + transaction + '.json'
        f=open( filepath , 'r' )
        transactionData = json.loads(f.readline())
    except IOError:
        return 'TRANSACTION_NOT_FOUND'

    #filter by validity status
    #offer.invalid == true then offer invalid
    #offer.payment_expired == true then offer invaid
    validitystruct = []
    if validitystatus != 'ANY':
        for offer in transactionData:
            if validitystatus == 'INVALID' and str(offer['invalid']).upper() == 'TRUE':
                validitystruct.append(offer)
            elif validitystatus == 'EXPIRED' and str(offer['payment_expired']).upper() == 'TRUE':
                validitystruct.append(offer)
            elif validitystatus == 'VALID' and str(offer['invalid']).upper() == 'FALSE' and str(offer['payment_expired']).upper() == 'FALSE':
                validitystruct.append(offer);
        return validitystruct
    else:
        return transactionData

def filterTransaction(transaction):
    #get transaction data
    try:
        datadir = data_dir_root + '/tx'
        filepath =  datadir + '/' + transaction + '.json'
        f=open( filepath , 'r' )
        transactionData = json.loads(f.readline())
        return transactionData
    except IOError:
        return 'TRANSACTION_NOT_FOUND'

def offers_handler(environ, start_response):
    return general_handler(environ, start_response, offers_response)

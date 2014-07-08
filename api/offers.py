import urlparse
import os, sys, tempfile, json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *

data_dir_root = os.environ.get('DATADIR')

def offers_response(response_dict):
    expected_fields=['type','currencyType']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
    
    #DEBUG     info(['dict',response_dict])        
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
        address_arr = json.loads(response_dict['address'][0])
        if type(address_arr) == type([]):
            data = filterOffers(address_arr,response_dict['currencyType'][0].upper(), response_dict['offerType'][0].upper())
        else:
            data = { 'ERR': 'Address field must be a list or array type' }
    
    response_status='OK'
    response='{"status":"'+response_status+'", "data":'+ str(json.dumps(data)) +'}'
    
    #DEBUG print response
    return (response, None)

def filterOffersByTime( request_data , time_seconds=86400):
    import glob
    import time

    ct = request_data['currencyType'][0]
    ot = request_data['orderType'][0] if request_data.has_key('orderType') else 'OFFER'

    otLookup = { 'OFFER': 'Sell offer', 'ACCEPT': 'Sell accept' }
    #for each file in /tx
    #    extract timestamp
    #    compare it to within the time given
    #    make sure its a sell offer
    #    if so, add to array
    #    pass back array

    #filter by currency
    #data is from /tx so using 'currencyId' key to identify
    if ct == 'MSC':
        currency = '00000001'
    else:
        currency = '00000002'

    atleast_now = int( str( int(time.time() - time_seconds) ) + '000'  )
    transactions = glob.glob(data_dir_root + '/www/tx/*')

    transaction_data = []
    for transaction in transactions:
        if transaction[-5:] == '.json':
          with open( transaction , 'r' ) as f:
            tx = json.loads(f.readline())[0]
            
            #filtering begins here
            if tx['invalid'] == False and tx.has_key('currencyId'):
                if int(tx['tx_time']) >= (atleast_now-time_seconds) and \
                   str(tx['currencyId']) == currency and \
                   str(tx['tx_type_str']) == otLookup[ot]:
                    #DEBUG info(['hash', tx['tx_hash']])
                    #DEBUG info(['test', tx['currencyId'], currency])
                    #DEBUG info([tx['tx_type_str'], otLookup[ot]])
                    #DEBUG info(['tx time ', time.ctime( int(str( tx['tx_time'] )[:-3]) ) ])
                    #DEBUG info(['now time - time_s ', time.ctime( int(str(atleast_now-time_seconds)[:-3]) ) ])
                    transaction_data.append(tx)
    
    return transaction_data

def filterOffers(addresses,currencytype, offertype):
    # currencyType   =  TMSC or MSC
    # offerType      =  SELL, ACCEPT or BOTH
    
    #DEBUG info(['addr',addresses])
    offers = {}
    for address in addresses:
        offers[address] = {}
        #get list of all offers by address
        try:
            datadir = data_dir_root + '/addr'
            filepath =  datadir + '/' + address + '.json'
            f=open( filepath , 'r' )
            allOffers = json.loads(f.readline())
        except IOError:
            offers[address] = 'ADDRESS_NOT_FOUND'
            continue
        

        #filter by currency
        #1 is TMSC 
        #0 is MSC
        if currencytype == 'MSC':   #only need MSC so del TMSC
            del allOffers['1']
        elif currencytype == 'TMSC':  #only need TMSC so del MSC
            del allOffers['0']
        elif currencytype == 'BOTH':
            pass

        #filter by offer type
        #accept_tx are offers accepted
        #bought_tx are offers bought
        #offer_tx are offers of sale
        #sold_tx are offers sold
        #recieved and sent tx are simple send
        #exodus tx is not related to offers

        accept_tx = { 'TMSC': [], 'MSC': [] }
        bought_tx = { 'TMSC': [], 'MSC': [] }
        offer_tx =  { 'TMSC': [], 'MSC': [] }
        sold_tx =   { 'TMSC': [], 'MSC': [] }


        for key in allOffers:
            keystr = 'MSC' if key == '0' else 'TMSC'
            if isinstance(allOffers[key],dict) and int(key) < 2:
                if offertype == 'BOTH':
                    accept_tx[ keystr ] += allOffers[key]['accept_transactions']
                    bought_tx[ keystr ] += allOffers[key]['bought_transactions']
                    offer_tx[ keystr ] += allOffers[key]['offer_transactions']
                    sold_tx[ keystr ] += allOffers[key]['sold_transactions']
                elif offertype == 'ACCEPT': #accept_tx
                    accept_tx[ keystr ] += allOffers[key]['accept_transactions']
                    bought_tx[ keystr ] += allOffers[key]['bought_transactions']
                elif offertype == 'SELL': #offer_tx
                    offer_tx[ keystr ] += allOffers[key]['offer_transactions']
                    sold_tx[ keystr ] += allOffers[key]['sold_transactions']
        
        offers[address]['accept_tx'] = accept_tx
        offers[address]['bought_tx'] = bought_tx
        offers[address]['offer_tx'] = offer_tx
        offers[address]['sold_tx'] = sold_tx

        print accept_tx
        
    return offers

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

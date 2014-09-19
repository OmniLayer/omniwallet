import urlparse
import os, sys, tempfile, json
import glob,time
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *
from decimal import *

sqlconn = sql_connect()
data_dir_root = os.environ.get('DATADIR')

def offers_response(response_dict):
    expected_fields=['type','currencyType']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
    
    #DEBUG     info(['dict',response_dict])        
    if response_dict['type'][0].upper() == "TIME":
        if 'time' in response_dict:
            time = int(response_dict['time'][0])
        else:
            time = 86400
        data = filterOffersByTime( response_dict , time  )
    else:
        address_arr = json.loads(response_dict['address'][0])
        if 'offerType' not in response_dict: response_dict['offerType'][0] = 'OFFER' #Input checks
        if type(address_arr) == type([]):
            data = filterOffers(address_arr,response_dict['currencyType'][0].upper(), response_dict['offerType'][0].upper())
        else:
            data = { 'ERR': 'Address field must be a list or array type' }
    
    response_status='OK'
    response='{"status":"'+response_status+'", "data":'+ str(json.dumps(data)) +'}'
    
    #DEBUG print response
    return (response, None)

def filterOffersByTime( request_data , time_seconds=86400):
    #filter by currency
    ct = request_data['currencyType'][0]
    currency = '1' if ct == 'MSC' else '2'

    atleast_now = int( str( int(time.time() - time_seconds) ) + '000' )

    #TODO get inactive offers?
    sqlconn.execute("select * from activeoffers ao, transactions t, txjson tj where ao.propertyidselling=" + currency + " and ao.lasttxdbserialnum=-1 and ao.createtxdbserialnum=t.txdbserialnum and ao.createtxdbserialnum=tj.txdbserialnum")
    ROWS= sqlconn.fetchall()

    response = [ mapSchema(row) for row in ROWS if int(mapSchema(row)['tx_time']) > atleast_now ]

    return sorted(response, key=lambda x:  int(x['tx_time']) )
    
def mapSchema(row):
  rawdata = row[-1]
  response = {
    'action': -1, #don't have this data
    'block': str(row[-5]),
    'currencyId': str(rawdata['propertyid']),
    'currency_str': 'Mastercoin' if str(rawdata['propertyid']) == '1' else 'Test Mastercoin',
    'formatted_amount': str(rawdata['amount']),
    'formatted_amount_available': str( row[1] / Decimal(1e8) ),
    'formatted_bitcoin_amount_desired': str( row[2] / Decimal(1e8) ),
    'formatted_block_time_limit': str(rawdata['timelimit']),
    'formatted_fee_required': str(rawdata['feerequired']),
    'formatted_price_per_coin': str( Decimal( rawdata['bitcoindesired'] ) / Decimal( rawdata['amount'] ) ),
    'from_address': rawdata['sendingaddress'],
    'tx_type_str': "Sell offer" if row[-11] == 20 else 'Sell accept',
    'color': "bgc-new", #TODO fix
    'invalid': False if rawdata['valid'] == True else True,
    'to_address': "sell offer" if row[-11] == 20 else 'TODO', #TODO fix
    'tx_hash': rawdata['txid'],
    'tx_time': str(rawdata['blocktime']) + '000'
  }

  #keys that might be useful later
  #bitcoin_amount_desired: "00000000002625a0"
  #block_time_limit: "0f"
  #index: "884"
  #icon: "selloffer"
  #icon_text: "Sell offer done"
  
  return response

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

    return offers

def offers_handler(environ, start_response):
    return general_handler(environ, start_response, offers_response)

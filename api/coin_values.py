import requests
import sys, os, os.path
import json
import time
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_general import *


data_dir_root = os.environ.get('DATADIR')

def get_prices():
    
    filename = data_dir_root + '/www/values/BTC.json'
    btcvalue=get_btc_price()
    if btcvalue['price'] > 0:
      atomic_json_dump(btcvalue,filename)
      write_history(btcvalue)

    filename = data_dir_root + '/www/values/OMNI.json'
    mscvalue=get_msc_price()
    if mscvalue['price'] > 0:
      atomic_json_dump(mscvalue, filename)
      write_history(mscvalue)

    filename = data_dir_root + '/www/values/T-OMNI.json'
    atomic_json_dump(0, filename)
    for root, _, files in os.walk(data_dir_root + '/www/properties'):
        for f in files:
            fullpath = os.path.join(root, f)
            with open(fullpath, 'r') as property:
                sp = json.loads(property.readline())[0]
                symbol= 'SP' + str(sp['currencyId'])
                spvalue={
                               'symbol' : symbol,
                               'price': calculate_spt_price(sp)
                }
                if spvalue['price'] > 0:
                  atomic_json_dump(spvalue, data_dir_root + '/www/values/' + symbol + '.json')
                  write_history(spvalue)

def write_history(value):
    filename = data_dir_root + '/www/values/history/'+value['symbol']+'.json'
    log = None
    if os.path.isfile(filename):
        with open(filename) as file:
           log = json.load(file)  
    history={
             'timestamp': time.time(),
             'value': value
            }
    if log != None:
        log.append(history)
        atomic_json_dump(log, filename, False)
    else:
        atomic_json_dump(history, filename)

def calculate_spt_price(sp):
    if sp['currencyId'] == "3":
	return get_sp3_price() 
    elif sp['currencyId'] == "25":
        btcvalue=get_btc_price()
        if btcvalue['price'] > 0:
	  #set CryptoNext until api/exchange is live
	  return ((1 / btcvalue['price'])*100000000)
        else:
          return 0
    #elif sp['formatted_transactionType'] == 51:
        #return 1.0/int( sp['numberOfProperties'] )
    else:
        return 0
   
def get_btc_price():
    try:
      r= requests.get( 'https://api.bitcoinaverage.com/all', timeout=15 )  
      result_dict = {
         'symbol' : 'BTC',
         'price' : r.json()['USD']['averages']['last']
      }
    except requests.exceptions.RequestException:
      result_dict = {
         'symbol' : 'BTC',
         'price' : 0
      }

    return result_dict

def get_msc_price():
    try:
      r = requests.get( 'https://masterxchange.com/api/trades.php', timeout=15 )
    
      volume = 0;
      sum = 0;
 
      for trade in r.json():
          volume += float( trade['amount'] )
          sum += float( trade['amount'] ) * float(trade['price'] )

      result_dict = {
         'symbol' : 'OMNI',
         'price' : sum / volume
      }
    except requests.exceptions.RequestException:
      result_dict = {
         'symbol' : 'OMNI',
         'price' : 0
      }

    return result_dict

def get_sp3_price():
    #maidsafe
    try:
      r = requests.get( 'https://masterxchange.com/api/v2/trades.php?currency=maid', timeout=15 )

      volume = 0;
      sum = 0;

      for trade in r.json():
          volume += float( trade['amount'] )
          sum += float( trade['amount'] ) * float(trade['price'] )
    #BTC is calculated in satashis in getvalue, so adjust our value here to compensate
      return "{:.8f}".format( 100000000 * (sum / volume))
    except requests.exceptions.RequestException:
      return 0

if __name__ == "__main__":
    get_prices()

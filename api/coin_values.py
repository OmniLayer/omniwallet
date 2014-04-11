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
    atomic_json_dump(btcvalue,filename)
    write_history(btcvalue)
    filename = data_dir_root + '/www/values/MSC.json'
    mscvalue=get_msc_price()
    atomic_json_dump(mscvalue, filename)
    write_history(mscvalue)
    filename = data_dir_root + '/www/values/TMSC.json'
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

def get_btc_price():
    r= requests.get( 'https://api.bitcoinaverage.com/all' )
    result_dict = {
       'symbol' : 'BTC',
       'price' : r.json()['USD']['averages']['last']
    }
    return result_dict

def get_msc_price():
    r = requests.get( 'https://masterxchange.com/api/trades.php' )
    
    volume = 0;
    sum = 0;
 
    for trade in r.json():
        volume += float( trade['amount'] )
        sum += float( trade['amount'] ) * float(trade['price'] )

    result_dict = {
       'symbol' : 'MSC',
       'price' : sum / volume
    }
    return result_dict
        
        
def calculate_spt_price(sp):
    if sp['formatted_transactionType'] == 51:
        return 1.0/int( sp['numberOfProperties'] )
    else:
        return 0
   
if __name__ == "__main__":
    get_prices()

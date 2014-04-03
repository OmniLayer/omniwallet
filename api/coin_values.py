import requests
import sys, os, os.path
import json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_parsing import *


data_dir_root = os.environ.get('DATADIR')

def get_prices():
    
    filename = data_dir_root + '/www/values/BTC.json'
    atomic_json_dump(get_btc_price(),filename)
    filename = data_dir_root + '/www/values/MSC.json'
    atomic_json_dump(get_msc_price(), filename)
    for root, _, files in os.walk(data_dir_root + '/www/properties'):
        for f in files:
            fullpath = os.path.join(root, f)
            with open(fullpath, 'r') as property:
                sp = json.loads(property.readline())[0]
                symbol= 'SP' + str(sp['currencyId'])
                atomic_json_dump({
                               'symbol' : symbol,
                               'price': calculate_spt_price(sp)
                }, data_dir_root + '/www/values/' + symbol + '.json')

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
    
                
def calculate_spt_price(sp):
    return 0
   
if __name__ == "__main__":
    get_prices()
import urlparse
import os, sys
import json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *

data_dir_root = os.environ.get('DATADIR')

def get_msc_balances( addr ):
  filename = data_dir_root + '/www/addr/' + addr + '.json'

  if not os.path.exists(filename):
    return ( None, '{ "status": "NOT FOUND: ' + filename + '" }' );

  with open(filename, 'r') as f:
    address_data = json.load(f)
    # Once the data's been loaded, remove the BTC entry since we're going to 
    #    use sx's BTC balances directly.
    balance_data = address_data[ 'balance' ]
    for i in (0,len( balance_data )-1):
      if balance_data[ i ][ 'symbol' ] == 'BTC':
        balance_data.pop( i )
        break

  return ( address_data, None )
  

def get_balance_response(request_dict):
  try:
      addrs_list=request_dict['addr']
  except KeyError:
      return (None, 'no address in dictionary')
      
  if len(addrs_list)!=1:
      return response(none, 'no single address')
  addr=addrs_list[0]

  address_data, err = get_msc_balances( addr )
  if err != None:
    address_data = {}
    address_data[ 'address' ] = addr
    address_data[ 'balance' ] = []

  return (json.dumps( address_data ), None)

def get_balance_handler(environ, start_response):
  return general_handler(environ, start_response, get_balance_response)


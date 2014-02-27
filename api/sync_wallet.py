import urlparse
import os, sys
import json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *

data_dir_root = os.environ.get('DATADIR')

def sync_wallet_response(request_dict):
  if not request_dict.has_key('type'):
    return (None, 'No field type in response dict '+str(request_dict))

  req_type = request_dict['type'][0].upper()
  wallet = json.loads(request_dict['wallet'][0])
  if req_type == "CREATEWALLET":
    if(exists(wallet)):
      print 'exists'
      response = { 'status': 'EXISTS' }
      return (json.dumps(response), None)
    else:
      sync_wallets(wallet)
  elif req_type == "SYNCWALLET":
    sync_wallets(wallet)
  else:
    return (None, req_type + ' is not supported')

  response = { 'status': 'OK' }
  return (json.dumps(response), None)


def sync_wallets(wallet):
  email = wallet['email']
  filename = data_dir_root + '/wallets/' + email + '.json'
  with open(filename, 'w') as f:
    json.dump(wallet, f)

def exists(wallet):
  email = wallet['email']
  filename = data_dir_root + '/wallets/' + email + '.json'
  print filename
  return os.path.exists(filename)


def sync_wallet_handler(environ, start_response):
  return general_handler(environ, start_response, sync_wallet_response)


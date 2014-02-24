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
  if req_type == "SYNCWALLET":
    syncWallets(request_dict['wallet'][0])
  else:
    return (None, req_type + ' is not supported')

  response = { 'status': 'OK' }
  return (json.dumps(response), None)


def syncWallets(wallet_json):
  wallet = json.loads(wallet_json)
  email = wallet['email']
  filename = data_dir_root + '/wallets/' + email + '.json'
  with open(filename, 'w') as f:
    json.dump(wallet, f)

  return "OK"

def sync_wallet_handler(environ, start_response):
  return general_handler(environ, start_response, sync_wallet_response)


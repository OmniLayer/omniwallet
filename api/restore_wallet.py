import urlparse
import os, sys
import json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *

data_dir_root = os.environ.get('DATADIR')

def restore_wallet_response(request_dict):
  if not request_dict.has_key('type'):
    return (None, 'No field type in response dict '+str(request_dict))

  req_type = request_dict['type'][0].upper()
  if req_type == "RESTOREWALLET":
    wallet, error = restore_wallet(request_dict['uuid'][0])
  else:
    return (None, req_type + ' is not supported')

  if error != None:
    response = { 'status': error }
  else:
    response = { 'status': 'OK',
                 'wallet': wallet }

  return (json.dumps(response), None)


def restore_wallet(uuid):
  filename = data_dir_root + '/wallets/' + uuid + '.json'

  if not os.path.exists(filename):
    return (None, "MISSING")

  with open(filename, 'r') as f:
    wallet = json.load(f)

  return (wallet, None)

def restore_wallet_handler(environ, start_response):
  return general_handler(environ, start_response, restore_wallet_response)


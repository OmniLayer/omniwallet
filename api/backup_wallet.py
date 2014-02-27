import urlparse
import os, sys
import json
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_apps import *
from restore_wallet import restore_wallet

data_dir_root = os.environ.get('DATADIR')

def backup_wallet_response(request_dict):
  print 'backup'
  if not request_dict.has_key('type'):
    return (None, 'No field type in response dict '+str(request_dict))

  req_type = request_dict['type'][0].upper()
  if req_type == "BACKUPWALLET":
    wallet, error = restore_wallet(request_dict['email'][0])
  else:
    return (None, req_type + ' is not supported')

  if error != None:
    response = { 'status': error }
  else:
    response = wallet

  return (json.dumps(response), None)


def backup_wallet_handler(environ, start_response):
  return general_handler(environ, start_response, backup_wallet_response, headers=[('Content-Disposition', 'attachment; filename="wallet.json"')])


import urlparse
import os, sys
import json
from debug import *
from balancehelper import *

def get_balance_v2_response(request_dict):
  import re
  print "get_balance_response(request_dict)",request_dict

  try:
      addrs_list=request_dict['addr']
  except KeyError:
      return (None, 'no address in dictionary')
      
  if len(addrs_list)<1:
      return response(none, 'must provide at least one address')
  elif len(addrs_list)>20:
      return response(none, 'max address supported 20')

  clean_list=[]
  for addr in addrs_list:
    clean_list.append(re.sub(r'\W+', '', addr)) #check alphanumeric

  return (json.dumps( get_bulkbalancedata(clean_list) ), None)

def get_balance_v2_handler(environ, start_response):
  return general_handler(environ, start_response, get_balance_v2_response)


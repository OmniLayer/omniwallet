import urlparse
import os, sys
import json
#tools_dir = os.environ.get('TOOLSDIR')
#lib_path = os.path.abspath(tools_dir)
#sys.path.append(lib_path)
from msc_apps import *
from debug import *


TIMEOUT='timeout -s 9 60 '
# Get the Mastercoin balances.  Not that this is also creating the default balance
# object, and should run before all the other currency checks.
def get_msc_balances( addr ):
  #TODO move functionality for individual currencies into /tx/ endpoint (sent, received, total reserved balances, etc.)
  addr = re.sub(r'\W+', '', addr) #check alphanumeric
  ROWS=dbSelect("select * from addressbalances ab, smartproperties sp where ab.address=%s and ab.propertyid=sp.propertyid "
                "and sp.protocol='Mastercoin'", [addr])

  address_data = { 'address' : addr, 'balance': [] }
  for balrow in ROWS:
      cID = str(int(balrow[2])) #currency id
      sym_t = ('BTC' if cID == '0' else ('MSC' if cID == '1' else ('TMSC' if cID == '2' else 'SP' + cID) ) ) #symbol template
      divi = balrow[-1]['divisible'] if type(balrow[-1]) == type({}) else json.loads(balrow[-1])['divisible']  #Divisibility
      res = { 'symbol' : sym_t, 'divisible' : divi  }
      res['value'] = ('%.8f' % float(balrow[4])).rstrip('0').rstrip('.')
      #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
      address_data['balance'].append(res)

  if 0 >= len(ROWS):
    return ( None, '{ "status": "NOT FOUND: ' + addr + '" }' )

  #Dead code
  #if type(balance_data[i]['value']) != type(0): #if not int convert (divisible property)
  #    balance_data[ i ][ 'divisible' ] = True
  #    balance_data[ i ][ 'value' ] = int( round( float( balance_data[ i ][ 'value' ]) * 100000000 ))
  
  #Dead code
  #for i in xrange( 0, len( balance_data )):
  #  if balance_data[ i ][ 'value' ] == '0.0':
  #    balance_data.pop( i )

  return ( address_data, None )

# Get the Bitcoin balances - this is a different format from the MSC one above.
def get_btc_balances( addr ):
  balances = { 'symbol': 'BTC', 'divisible': True }
  out, err = run_command(TIMEOUT+ 'sx balance -j ' + addr )
  if err != None:
    return None, err
  elif out == '':
    return None, 'No bitcoin balance available.  Invalid address?: ' + addr
  else:
    try:
        balances[ 'value' ] = int( json.loads( out )[0][ 'paid' ])
    except ValueError:
        balances[ 'value' ] = int(-666)

  return ( [ balances ], None )

def get_balance_response(request_dict):
  import re
  try:
      addrs_list=request_dict['addr']
  except KeyError:
      return (None, 'no address in dictionary')
      
  if len(addrs_list)!=1:
      return response(none, 'no single address')
  addr=addrs_list[0]

  addr = re.sub(r'\W+', '', addr) #check alphanumeric

  address_data, err = get_msc_balances( addr )
  if err != None:
    address_data = {}
    address_data[ 'address' ] = addr
    address_data[ 'balance' ] = []

  bitcoin_balances, err = get_btc_balances( addr )

  if err == None:
    for i in xrange(0,len( bitcoin_balances )):
      address_data[ 'balance' ].append( bitcoin_balances[i] )

  return (json.dumps( address_data ), None)

def get_balance_handler(environ, start_response):
  return general_handler(environ, start_response, get_balance_response)


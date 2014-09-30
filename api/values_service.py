from flask import Flask, abort, json
from sqltools import *
import re

app = Flask(__name__)
app.debug = True

@app.route('/<currency>')
def getCurrentPrice(currency=None):

  if currency == None:
    abort(400)

  #cleanse our input name
  pattern=re.compile('[\W_]+')
  input=pattern.sub('', currency.split('.')[0]).upper()
  currency=None

  if input[:2].upper() == "SP":
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=input[2:]

  elif len(input) == 6:
    #double currency, return btc using second currency
    base=input[:3]
    currency=input[3:]
    protocol1='Fiat'
    pid1=getPropertyid(currency, protocol1)
    protocol2='Bitcoin'
    pid2=getPropertyid(base, protocol2)

  elif input == 'BTC':
    #default to USD
    protocol1='Fiat'
    pid1=getPropertyid('USD', protocol1)
    protocol2='Bitcoin'
    pid2=getPropertyid('BTC', protocol2)

  elif input == 'MSC':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=1

  elif input == 'TMSC':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=2

  else:
    return json.dumps([0])


  ROWS=dbSelect("select rate1for2 from exchangerates where protocol1=%s and propertyid1=%s and "
                "protocol2=%s and propertyid2=%s and rate1for2 !=0 order by asof desc limit 1",
                (protocol1,pid1,protocol2,pid2))

  if len(ROWS)==0:
    #no returnable value, dump 0
    response = [{ 'price': 0,
                 'symbol': input
               }]
  else:
    if currency==None:
      response = [{ 'price': ROWS[0][0],
                   'symbol': input
                 }]
    else:
      response = [{ 'price': ROWS[0][0],
                   'symbol': base,
                   'currency': currency
                 }]

  json_response = json.dumps(response)
  return json_response


def getPropertyid(abv,protocol):
  ROWS=dbSelect("select propertyid from smartproperties where protocol=%s and propertyname=%s",(protocol,abv.upper()))
  if len(ROWS) == 0:
    return -1
  else:
    return ROWS[0][0]


#TODO COnversion
@app.route('/history/<currency>')
def history(currency=None):

  if currency == None:
    abort(400)

  #cleanse our input name
  pattern=re.compile('[\W_]+')
  input=pattern.sub('', currency.split('.')[0]).upper()
  currency=None

  if input[:2].upper() == "SP":
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=input[2:]

  elif len(input) == 6:
    #double currency, return btc using second currency
    base=input[:3]
    currency=input[3:]
    protocol1='Fiat'
    pid1=getPropertyid(currency, protocol1)
    protocol2='Bitcoin'
    pid2=getPropertyid(base, protocol2)

  elif input == 'BTC':
    #default to USD
    protocol1='Fiat'
    pid1=getPropertyid('USD', protocol1)
    protocol2='Bitcoin'
    pid2=getPropertyid('BTC', protocol2)

  elif input == 'MSC':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=getPropertyid('MSC', protocol2)

  elif input == 'TMSC':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Mastercoin'
    #strip off the SP and grab just the numbers
    pid2=getPropertyid('TMSC', protocol2)

  else:
    return json.dumps([0])


  ROWS=dbSelect("select rate1for2, extract(epoch from asof) from exchangerates where protocol1=%s and propertyid1=%s and "
                "protocol2=%s and propertyid2=%s and rate1for2 !=0 order by asof desc",
                (protocol1,pid1,protocol2,pid2))

  response=[]

  if len(ROWS)==0:
    #no returnable value, dump 0
    response = [{ 'price': 0,
                 'symbol': input
               }]
  else:
    for time in ROWS:
      if currency==None:
        item = {'timestamp': time[1],
                'value': {'price': time[0],
                          'symbol': input
                         }
               }
      else:
        item = {'timestamp': time[1],
                'value': {'price': time[0],
                          'symbol': base,
                          'currency': currency
                         }
               }
      response.append(item)

  json_response = json.dumps(response)
  return json_response


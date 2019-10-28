from flask import Flask, abort, json, jsonify, Response
from sqltools import *
import re

app = Flask(__name__)
app.debug = True

def getValueBook(pmaxid=0):
  book=[]
  DBID=dbSelect("select max(id) from exchangerates")
  ERMAX=int(DBID[0][0])
  if ERMAX > pmaxid:
   book=dbSelect("select sp.propertyname, rates.* from smartproperties sp join "
                  "(select er.* from exchangerates er join "
                    "(select distinct protocol1,propertyid1,protocol2,propertyid2, max(asof) asof from exchangerates "
                    "where propertyid2<2147483648 and propertyid2!=2 and rate1for2!=0 "
                    "group by protocol1,propertyid1,protocol2,propertyid2 "
                    "order by propertyid2,propertyid1) vlist "
                  "on er.protocol1=vlist.protocol1 and er.propertyid1=vlist.propertyid1 "
                  "and er.protocol2=vlist.protocol2 and er.propertyid2=vlist.propertyid2 "
                  "and er.asof=vlist.asof) rates "
                "on CASE WHEN rates.protocol1='Fiat' "
                  "THEN rates.propertyid1=sp.propertyid and sp.protocol='Fiat' "
                  "ELSE rates.propertyid2=sp.propertyid and (sp.protocol='Omni' or sp.protocol='Bitcoin') END")
  return book,ERMAX

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
    protocol2 = 'Omni'
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

  elif input == 'OMNI':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Omni'
    #strip off the SP and grab just the numbers
    pid2=1

  elif input == 'T-OMNI':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Omni'
    #strip off the SP and grab just the numbers
    pid2=2

  else:
    return jsonify({ 'price': 0, 'symbol': input })


  ROWS=dbSelect("select rate1for2 from exchangerates where protocol1=%s and propertyid1=%s and "
                "protocol2=%s and propertyid2=%s and rate1for2 !=0 order by asof desc limit 1",
                (protocol1,pid1,protocol2,pid2))

  if len(ROWS)==0:
    #no returnable value, dump 0
    response = { 'price': 0,
                 'symbol': input
               }
  else:
    if currency==None:
      response = { 'price': ROWS[0][0],
                   'symbol': input
                 }
    else:
      response = { 'price': ROWS[0][0],
                   'symbol': base,
                   'currency': currency
                 }

  json_response = jsonify(response)
  return json_response


def getPropertyid(abv,protocol):
  ROWS=dbSelect("select propertyid from smartproperties where protocol=%s and propertyname=%s",(protocol,abv.upper()))
  if len(ROWS) == 0:
    return -1
  else:
    return ROWS[0][0]

@app.route('/currencylist')
def currencylist():
  ROWS=dbSelect("select distinct propertyname,issuer from smartproperties sp , exchangerates ex "
                "where sp.protocol=ex.protocol1 and sp.protocol='Fiat' and ex.rate1for2 !=0 order by issuer")

  retval=[]
  for x in ROWS:
   retval.append({'value':x[0],'label':x[1]})

  return Response(json.dumps(retval), mimetype="application/json")

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
    protocol2='Omni'
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

  elif input == 'OMNI':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Omni'
    #strip off the SP and grab just the numbers
    pid2=getPropertyid('OMNI', protocol2)

  elif input == 'T-OMNI':
    protocol1='Bitcoin'
    pid1=getPropertyid('BTC', protocol1)
    protocol2='Omni'
    #strip off the SP and grab just the numbers
    pid2=getPropertyid('T-OMNI', protocol2)

  else:
    return jsonify([0])


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

  return Response(json.dumps(response), mimetype="application/json")

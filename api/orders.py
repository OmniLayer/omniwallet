from flask import Flask, request, jsonify, abort, json
from msc_apps import *

app = Flask(__name__)
app.debug = True

@app.route('/')
def orders():

  maxblock=dbSelect("select max(blocknumber) from orderblob")[0][0]
  orders=json.loads(dbSelect("select orders from orderblob where blocknumber=%s",[maxblock])[0][0])

  return jsonify({ 'orders': orders })

@app.route('/book')
def orderbook():

   rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,remainingdesired "
                   "from orderbook where orderstate='open' or orderstate='open-part-filled'")
   orders=[]
   for order in rows:
     data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':order[2], 'remainingforsale':order[3],
           'propertydesired':order[4], 'amountdesired':order[5], 'remainingdesired':order[6] }
     orders.append(data)

   response_status='OK'
   response='{"status":"'+response_status+'", "data":'+ str(orders) +'}'

   return (response, None)

@app.route('/book/all')
def orderbookall():

   rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,remainingdesired,orderstate "
                   "from orderbook")

   orders=[]
   for order in rows:
     data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':order[2], 'remainingforsale':order[3],
           'propertydesired':order[4], 'amountdesired':order[5], 'remainingdesired':order[6], 'orderstate':order[7] }
     orders.append(data)

   response_status='OK'
   response='{"status":"'+response_status+'", "data":'+ str(orders) +'}'

   return (response, None)

@app.route('/book/address/<address>')
def orderbookbyaddress(address):

   try:
     address = re.sub(r'\W+', '', address) #check alphanumeric
     rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,remainingdesired,orderstate "
                   "from orderbook where seller=%s",[address])

     orders=[]
     for order in rows:
       data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':order[2], 'remainingforsale':order[3],
             'propertydesired':order[4], 'amountdesired':order[5], 'remainingdesired':order[6], 'orderstate':order[7] }
       orders.append(data)

     response_status='OK'
     response='{"status":"'+response_status+'", "data":'+ str(orders) +'}'
   except TypeError:
     response_status='Not OK'
     response='{"status":"'+response_status+'", "data": No Addresses provided}'


   return (response, None)


@app.route('/book/pair/<int:currency1>/<int:currency2>')
def orderbookbypair(currency1=None,currency2=None):

   try:
     currency1 = re.sub(r'\D', '', str(currency1)) #check alphanumeric
     currency2 = re.sub(r'\D', '', str(currency2)) #check alphanumeric

     rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,remainingdesired,orderstate "
                     "from orderbook where propertyforsale=%s and propertydesired=%s",(currency1,currency2))

     orders=[]
     for order in rows:
       data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':order[2], 'remainingforsale':order[3],
             'propertydesired':order[4], 'amountdesired':order[5], 'remainingdesired':order[6], 'orderstate':order[7] }
       orders.append(data)

     response_status='OK'
     response='{"status":"'+response_status+'", "data":'+ str(orders) +'}'
   except TypeError:
     response_status='Not OK'
     response='{"status":"'+response_status+'", "data": No currency provided}'


   return (response, None)


from flask import Flask, request, jsonify, abort, json
from msc_apps import *
import decimal

app = Flask(__name__)
app.debug = True

@app.route('/')
def orders():

  maxblock=dbSelect("select max(blocknumber) from orderblob")[0][0]
  orders=json.loads(dbSelect("select orders from orderblob where blocknumber=%s",[maxblock])[0][0])

  return jsonify({ 'orders': orders })

@app.route('/book/')
def orderbook():

   rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,desiredreceived "
                   "from orderbook where orderstate='open' or orderstate='open-part-filled'")
   orders=[]
   for order in rows:
     amountforsale=order[2]
     remainingforsale=order[3]
     amountdesired=order[5]
     desiredreceived=order[6]

     data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':amountforsale, 'remainingforsale':remainingforsale,
           'propertydesired':order[4], 'amountdesired':amountdesired, 'desiredreceived':desiredreceived }
     orders.append(data)

   response_status='OK'
   response=jsonify({"status":response_status, "orders":orders})

   return (response, None)

@app.route('/book/all/')
def orderbookall():

   rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,desiredreceived,orderstate "
                   "from orderbook")

   orders=[]
   for order in rows:
     amountforsale=order[2]
     remainingforsale=order[3]
     amountdesired=order[5]
     desiredreceived=order[6]

     data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':amountforsale, 'remainingforsale':remainingforsale,
           'propertydesired':order[4], 'amountdesired':amountdesired, 'desiredreceived':desiredreceived, 'orderstate':order[7] }
     orders.append(data)

   response_status='OK'
   response=jsonify({"status":response_status, "orders":orders})

   return (response, None)

@app.route('/book/address/<address>')
def orderbookbyaddress(address):

   try:
     address = re.sub(r'\W+', '', address) #check alphanumeric
     rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,desiredreceived,orderstate "
                   "from orderbook where seller=%s",[address])

     orders=[]
     for order in rows:
       amountforsale=order[2]
       remainingforsale=order[3]
       amountdesired=order[5]
       desiredreceived=order[6]

       data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':amountforsale, 'remainingforsale':remainingforsale,
             'propertydesired':order[4], 'amountdesired':amountdesired, 'desiredreceived':desiredreceived, 'orderstate':order[7] }
       orders.append(data)

     response_status='OK'
     response=jsonify({"status":response_status, "orders":orders})
   except TypeError:
     response_status='Error'
     response=jsonify({"status":response_status, "error":"No Addresses Provided"})


   return (response, None)


@app.route('/book/pair/<int:currency1>/<int:currency2>')
def orderbookbypairshort(currency1=None,currency2=None):
  return orderbookbypair(currency1,currency2,0)

@app.route('/book/pair/<int:currency1>/<int:currency2>/<int:displayclosed>')
def orderbookbypair(currency1=None,currency2=None, displayclosed=0):

   try:
     currency1 = re.sub(r'\D', '', str(currency1)) #check alphanumeric
     currency2 = re.sub(r'\D', '', str(currency2)) #check alphanumeric
     displayclosed = re.sub(r'\D', '', str(displayclosed)) #check alphanumeric

     if int(currency1) > 0 and int(currency1) < 4294967295 and int(currency2) > 0 and int(currency2) < 4294967295:
       if displayclosed == "1":
         rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,desiredreceived,orderstate "
                       "from orderbook where propertyforsale=%s and propertydesired=%s",(currency1,currency2))
       else:
         rows=dbSelect("select seller,propertyforsale,amountforsale,remainingforsale,propertydesired,amountdesired,desiredreceived,orderstate "
                       "from orderbook where propertyforsale=%s and propertydesired=%s and orderstate in ('open','open-part-filled')",
                       (currency1,currency2))


       orders=[]
       for order in rows:
         amountforsale=order[2]
         remainingforsale=order[3]
         amountdesired=order[5]
         desiredreceived=order[6]

         data={'seller': order[0], 'propertyforsale':order[1], 'amountforsale':amountforsale, 'remainingforsale':remainingforsale,
               'propertydesired':order[4], 'amountdesired':amountdesired, 'desiredreceived':desiredreceived, 'orderstate':order[7] }
         orders.append(data)

       response_status='OK'
       response=jsonify({"status":response_status, "orders":orders})
     else:
       response_status='Error'
       response=jsonify({"status":response_status, "error":"Bad Currency ID"})
   except TypeError:
     response_status='Error'
     response=jsonify({"status":response_status, "error":"No Currency ID Provided"})


   return (response, None)


from flask import Flask, request, jsonify, abort, json, make_response
import re
import time
from sqltools import * 
from math import ceil
app = Flask(__name__)
app.debug = True


def fixDecimal(value):
    try:
      return str(ceil(float(value)*(1e8))/1e8)
    except Exception as e:
      print "couldn't convert ",value,"got error: ",e

#@app.route('/book')
def getOrderbook(lasttrade=0, lastpending=0):
    #use for websocket to load/broadcast updated book
    book={}
    trade=0
    updated=False

    #find last know DEx2.0 trade and see if it's newer than what we have
    trades=dbSelect("select max(txdbserialnum) from transactions where txtype >24 and txtype<29 and txstate='valid'")
    if len(trades) > 0 and len(trades[0]) > 0:
      trade=int(trades[0][0])

    pending=dbSelect("select coalesce(min(txdbserialnum),0) from transactions where txtype >24 and txtype<29 and txstate='pending'")
    if len(pending) > 0 and len(pending[0]) > 0:
      pending=int(pending[0][0])

    if (trade > int(lasttrade) or pending < int(lastpending)):
      AO=dbSelect("select distinct propertyiddesired, propertyidselling from activeoffers "
                  "where offerstate='active' order by propertyiddesired")
      if len(AO) > 0:
        for pair in AO:
          pd=int(pair[0])
          ps=int(pair[1])
          if 0 in [pd,ps]:
            #skip dex 1.0 sales
            continue
          data = get_orders_by_market(pd,ps)
          data2 = get_orders_by_market(ps,pd)
          try:
            book[pd][ps]=data
          except KeyError:
            book[pd]={ps: data}
          try:
            book[ps][pd]=data2
          except KeyError:
            book[ps]={pd: data2}
        updated=True

    ret={"updated":updated ,"book":book, "lasttrade":trade, "lastpending":pending}
    return ret
   

@app.route('/designatingcurrencies', methods=['POST'])
def getDesignatingCurrencies():
    try:
        value = int(re.sub(r'\D+', '', request.form['ecosystem']))
        valid_values = [1,2]
        if value not in valid_values:
            abort(make_response('Field \'ecosystem\' invalid value, request failed', 400))
        
        ecosystem = "Production" if value == 1 else "Test" 
    except KeyError:
        abort(make_response('No field \'ecosystem\' in request, request failed', 400))
    except ValueError:
        abort(make_response('Field \'ecosystem\' invalid value, request failed', 400))

    #designating_currencies = dbSelect("select distinct ao.propertyiddesired as propertyid, sp.propertyname from activeoffers ao "
    #                                  "inner join SmartProperties sp on ao.propertyiddesired = sp.propertyid and sp.ecosystem = %s "
                                      #"where (ao.propertyidselling not in (1, 2, 31)) or (ao.propertyidselling = 1 and ao.propertyiddesired = 31) "
    #                                  "where ao.offerstate='active' "
    #                                  "order by ao.propertyiddesired ",[ecosystem])
    designating_currencies = dbSelect("select distinct propertyiddesired,desiredname from markets where "
                                      "CASE WHEN %s='Production' THEN "
                                      "propertyiddesired > 0 and propertyiddesired < 2147483648 and propertyiddesired !=2 "
                                      "ELSE propertyiddesired > 2147483650 or propertyiddesired=2 END "
                                      "and (supply > 0 or propertyiddesired in "
                                        "(select propertyidselling as marketid from markets where "
                                        "CASE WHEN %s='Production' THEN "
                                        "propertyidselling > 0 and propertyidselling < 2147483648 and propertyidselling !=2 "
                                        "ELSE propertyidselling > 2147483650 or propertyidselling=2 END "
                                        " and supply >0)) "
                                      "order by propertyiddesired",(ecosystem,ecosystem))
    return jsonify({"status" : 200, "currencies": [
	{
	 "propertyid":currency[0], "propertyname" : currency[1], "displayname" : str(currency[1])+" #"+str(currency[0])
	} for currency in designating_currencies]})


@app.route('/<int:denominator>')
def get_markets_by_denominator(denominator):
    markets = dbSelect("select ma.propertyidselling as marketid, ma.sellingname as marketname, "
                        "CASE WHEN mb.unitprice=0 THEN 0 ELSE cast(1/mb.unitprice as numeric(27,8)) END as bidprice, "
                       "ma.unitprice as askprice, ma.supply, ma.lastprice, ma.marketpropertytype "
                       "from markets ma left outer join markets mb on ma.propertyidselling=mb.propertyiddesired "
                       "and ma.propertyiddesired=mb.propertyidselling where ma.propertyiddesired=%s and "
                       "( ma.supply>0 or ma.propertyidselling in "
                        "(select propertyiddesired as marketid from markets where propertyidselling=%s and supply>0) "
                       " ) order by ma.propertyidselling",(denominator,denominator))
    return jsonify({"status" : 200, "markets": [
	{
	 "propertyid":currency[0], 
	 "propertyname" : currency[1],
	 "bidprice" : float(currency[2]),
	 "askprice" : float(currency[3]),
	 "supply" : currency[4],
	 "lastprice" : float(currency[5]),
         "propertytype" : currency[6]
	} for currency in markets]})

@app.route('/ohlcv/<int:propertyid_desired>/<int:propertyid_selling>')
def get_OHLCV(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("SELECT timeframe.date,FIRST(offers.unitprice) ,MAX(offers.unitprice), MIN(offers.unitprice), "
                         "LAST(offers.unitprice), SUM(offers.totalselling) FROM generate_series('2016-01-01 00:00'::timestamp,current_date, '1 day') "
                         "timeframe(date) INNER JOIN (SELECT ao.totalselling, ao.unitprice, createtx.TXRecvTime as createdate, "
                         "COALESCE(lasttx.TXRecvTime,createtx.TXRecvTime) as solddate from ActiveOffers ao inner join Transactions createtx "
                         "on ao.CreateTXDBSerialNum = createtx.TxDBSerialNum left outer join Transactions lasttx on ao.LastTXDBSerialNum = lasttx.TxDBSerialNum "
                         "where (ao.OfferState = 'sold' or ao.OfferState = 'active')  and ao.unitprice > 0 and ao.PropertyIdSelling = %s and "
                         "ao.PropertyIdDesired = %s ORDER BY createtx.TXRecvTime DESC) offers on DATE(offers.createdate) <= timeframe.date and "
                         "DATE(offers.solddate) >= timeframe.date group by timeframe.date",[propertyid_selling, propertyid_desired])
    return jsonify({"status" : 200, "orderbook": [
        {
            "date":int((time.mktime(order[0].timetuple()) + order[0].microsecond/1000000.0)/86400), 
            "open":order[1], #if order[1] is not None else 160 - (0.01 * orderbook.index(order)),
            "high" : order[2], #if order[2] is not None else 160 + (0.01 * orderbook.index(order)),
            "low" : order[3], #if order[3] is not None else 160 - (0.01 * orderbook.index(order)),
            "close" : order[4], #if order[4] is not None else 160 + (0.01 * orderbook.index(order)),
            "volume": order[5], #if order[5] is not None else 34.5 + (11.2 * orderbook.index(order)),
            "adjustment":(order[2] + order[3]) /2
        } for order in orderbook]})


@app.route('/<int:propertyid_desired>/<int:propertyid_selling>')
def get_orders_by_market_json(propertyid_desired, propertyid_selling):
    return jsonify(get_orders_by_market(propertyid_desired, propertyid_selling))


def get_orders_by_market(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("SELECT ao.propertyiddesired, ao.propertyidselling, ao.AmountAvailable, ao.AmountDesired, ao.TotalSelling, ao.AmountAccepted, "
                         "cast(txj.txdata->>'unitprice' as numeric), ao.Seller, tx.TxRecvTime, 'active', tx.txhash from activeoffers ao, transactions tx, txjson txj "
                         "where ao.CreateTxDBSerialNum = txj.TxDBSerialNum and ao.CreateTxDBSerialNum = tx.TxDBSerialNum and ao.propertyiddesired = %s and "
                         "ao.propertyidselling = %s and ao.OfferState = 'active' union all select cast(txj.txdata->>'propertyiddesired' as bigint), "
                         "cast(txj.txdata->>'propertyidforsale' as bigint),CASE WHEN txj.txdata->>'propertyidforsaleisdivisible' = 'true' THEN "
                         "round(cast(txj.txdata->>'amountforsale' as numeric) * 100000000) ELSE cast(txj.txdata->>'amountforsale' as numeric) END, "
                         "CASE WHEN txj.txdata->>'propertyiddesiredisdivisible' = 'true' THEN round(cast(txj.txdata->>'amountdesired' as numeric) * 100000000) "
                         "ELSE cast(txj.txdata->>'amountdesired' as numeric) END,CASE WHEN txj.txdata->>'propertyidforsaleisdivisible' = 'true' THEN "
                         "round(cast(txj.txdata->>'amountforsale' as numeric) * 100000000) ELSE cast(txj.txdata->>'amountforsale' as numeric) END,0, "
                         "cast(txj.txdata->>'unitprice' as numeric),txj.txdata->>'sendingaddress', tx.TxRecvTime, 'pending',tx.txhash from transactions tx inner join txjson txj "
                         "on tx.txdbserialnum = txj.txdbserialnum where tx.txdbserialnum < 0 and tx.txtype = 25 and cast(txj.txdata->>'propertyidforsale' as numeric) = %s "
                         "and cast(txj.txdata->>'propertyiddesired' as numeric) = %s",[propertyid_desired,propertyid_selling,propertyid_selling,propertyid_desired])

    cancels = dbSelect("SELECT cast(txj.txdata->>'propertyiddesired' as bigint),cast(txj.txdata->>'propertyidforsale' as bigint),CASE WHEN "
                       "txj.txdata->>'propertyiddesiredisdivisible' = 'true' THEN round(cast(txj.txdata->>'amountdesired' as numeric) * 100000000) "
                       "ELSE cast(txj.txdata->>'amountdesired' as numeric) END,CASE WHEN txj.txdata->>'propertyidforsaleisdivisible' = 'true' THEN "
                       "round(cast(txj.txdata->>'amountforsale' as numeric) * 100000000) ELSE cast(txj.txdata->>'amountforsale' as numeric) END, "
                       "cast(txj.txdata->>'unitprice' as numeric),txj.txdata->>'sendingaddress', tx.TxRecvTime, 'pending', tx.txhash from transactions tx "
                       "inner join txjson txj on tx.txdbserialnum = txj.txdbserialnum where tx.txdbserialnum < 0 and tx.txtype = 26 and "
                       "cast(txj.txdata->>'propertyidforsale' as numeric) = %s and cast(txj.txdata->>'propertyiddesired' as numeric) = %s",
                       [propertyid_selling,propertyid_desired])

    return {"status" : 200, "orderbook": [
        {
            "propertyid_desired":order[0], 
            "propertyid_selling":order[1],
            "available_amount" : str(order[2]),
            "desired_amount" : str(order[3]),
            "total_amount" : str(order[4]),
            "accepted_amount": str(order[5]),
            "unit_price" : fixDecimal(order[6]),
            "seller" : str(order[7]),
            "time" : str(order[8]),
            "status" : order[9],
            "txhash" : str(order[10])
        } for order in orderbook], "cancels":[
        {
            "propertyid_desired":cancel[0], 
            "propertyid_selling":cancel[1],
            "desired_amount" : str(cancel[2]),
            "total_amount" : str(cancel[3]),
            "unit_price" : str(cancel[4]),
            "seller" : str(cancel[5]),
            "time" : str(cancel[6]),
            "txhash" : str(order[7])
        } for cancel in cancels]}

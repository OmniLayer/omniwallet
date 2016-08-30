from flask import Flask, request, jsonify, abort, json, make_response
import re
import time
from sqltools import * 
app = Flask(__name__)
app.debug = True



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

    designating_currencies = dbSelect("select distinct ao.propertyidselling as propertyid, sp.propertyname from activeoffers ao inner join SmartProperties sp on ao.propertyidselling = sp.propertyid and sp.ecosystem = %s where (ao.propertyiddesired not in (1, 2, 31)) or (ao.propertyiddesired = 1 and ao.propertyidselling = 31)  order by ao.propertyidselling ",[ecosystem])
    return jsonify({"status" : 200, "currencies": [{"propertyid":currency[0], "propertyname" : currency[1] } for currency in designating_currencies]})


@app.route('/<int:denominator>')
def get_markets_by_denominator(denominator):
    markets = dbSelect("SELECT distinct ao.propertyiddesired as marketid, desired.propertyname as marketname, max(ao.unitprice), sum(ao.amountdesired) as supply, max(ho.unitprice) from activeoffers ao inner join transactions createtx on ao.createtxdbserialnum = createtx.txdbserialnum left outer join activeoffers ho on ao.createtxdbserialnum = ho.createtxdbserialnum and createtx.txrecvtime < (CURRENT_TIMESTAMP - INTERVAL '1 day') inner join SmartProperties desired on ao.propertyiddesired = desired.propertyid and desired.protocol = 'Omni' where ao.propertyidselling = %s and (ao.OfferState = 'active' or ho.OfferState = 'sold') group by marketid, marketname order by supply;",[denominator])
    return jsonify({"status" : 200, "markets": [
    	{
    		"propertyid":currency[0], 
    		"propertyname" : currency[1],
            "price" : currency[2],
            "supply" : currency[3],
            "change" : currency[4] #currency[4] * 100 / currency[2] - 100
		} for currency in markets]})

@app.route('/ohlcv/<int:propertyid_desired>/<int:propertyid_selling>')
def get_OHLCV(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("SELECT timeframe.date,FIRST(offers.unitprice) ,MAX(offers.unitprice), MIN(offers.unitprice), LAST(offers.unitprice), SUM(offers.totalselling) FROM generate_series('2016-01-01 00:00'::timestamp,current_date, '1 day') timeframe(date) INNER JOIN (SELECT ao.totalselling, ao.unitprice, createtx.TXRecvTime as createdate, COALESCE(lasttx.TXRecvTime,createtx.TXRecvTime) as solddate from ActiveOffers ao inner join Transactions createtx on ao.CreateTXDBSerialNum = createtx.TxDBSerialNum left outer join Transactions lasttx on ao.LastTXDBSerialNum = lasttx.TxDBSerialNum where (ao.OfferState = 'sold' or ao.OfferState = 'active')  and ao.unitprice > 0 and ao.PropertyIdSelling = %s and ao.PropertyIdDesired = %s ORDER BY createtx.TXRecvTime DESC) offers on DATE(offers.createdate) <= timeframe.date and DATE(offers.solddate) >= timeframe.date group by timeframe.date",[propertyid_selling, propertyid_desired])
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
def get_orders_by_market(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("select ao.propertyiddesired, ao.propertyidselling, ao.AmountAvailable, ao.AmountDesired, ao.TotalSelling, ao.AmountAccepted, txj.txdata->'unitprice', ao.Seller, tx.TxRecvTime, 'active' from activeoffers ao, transactions tx, txjson txj where ao.CreateTxDBSerialNum = txj.TxDBSerialNum and ao.CreateTxDBSerialNum = tx.TxDBSerialNum and ao.propertyiddesired = %s and ao.propertyidselling = %s and ao.OfferState = 'active' union all select txj.txdata->'propertyiddesired',txj.txdata->'propertyidforsale',txj.txdata->'amountforsale',txj.txdata->'amountdesired',txj.txdata->'amountforsale',0,txj.txdata->'unitprice',txj.txdata->'sendingaddress', tx.TxRecvTime, 'pending' from transactions tx inner join txjson txj on tx.txdbserialnum = txj.txdbserialnum where tx.txdbserialnum < 0 and tx.txtype = 25 and cast(txj.txdata->>'propertyidforsale' as numeric(19)) = %s and cast(txj.txdata->>'propertyiddesired' as numeric(19)) = %s",[propertyid_desired,propertyid_selling,propertyid_selling,propertyid_desired])
    return jsonify({"status" : 200, "orderbook": [
        {
            "propertyid_desired":order[0], 
            "propertyid_selling":order[1],
            "available_amount" : str(order[2]),
            "desired_amount" : str(order[3]),
            "total_amount" : str(order[4]),
            "accepted_amount": str(order[5]),
            "unit_price" : str(order[6]),
            "seller" : str(order[7]),
            "time" : order[8],
            "status" : order[9]
        } for order in orderbook]})
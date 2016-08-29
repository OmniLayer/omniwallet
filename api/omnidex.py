from flask import Flask, request, jsonify, abort, json, make_response
import re
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

    designating_currencies = dbSelect("select distinct ao.propertyiddesired as propertyid, sp.propertyname from activeoffers ao inner join SmartProperties sp on ao.propertyiddesired = sp.propertyid and sp.ecosystem = %s where ao.propertyidselling not in (1, 2, 31)  order by ao.propertyiddesired ",[ecosystem])
    return jsonify({"status" : 200, "currencies": [{"propertyid":currency[0], "propertyname" : currency[1] } for currency in designating_currencies]})


@app.route('/<int:denominator>')
def get_markets_by_denominator(denominator):
    markets = dbSelect("select distinct CASE WHEN ao.propertyiddesired = %s THEN ao.propertyidselling WHEN ao.propertyidselling = %s THEN ao.propertyiddesired END as marketid, CASE WHEN ao.propertyiddesired = %s THEN selling.propertyname WHEN ao.propertyidselling = %s THEN desired.propertyname END as marketname, sum(ao.amountavailable) from activeoffers ao inner join SmartProperties selling on ao.propertyidselling = selling.propertyid and selling.protocol = 'Omni' inner join SmartProperties desired on ao.propertyiddesired = desired.propertyid and desired.protocol = 'Omni' where ao.propertyiddesired = %s or ao.propertyidselling = %s and ao.OfferState = 'active' group by marketid, marketname order by marketname;",[denominator,denominator,denominator,denominator,denominator,denominator])
    return jsonify({"status" : 200, "markets": [
    	{
    		"propertyid":currency[0], 
    		"propertyname" : currency[1],
    		"supply" : str(currency[2])
		} for currency in markets]})

@app.route('/ohlcv/<int:propertyid_desired>/<int:propertyid_selling>')
def get_OHLCV(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("SELECT timeframe.date,0 ,MAX(offers.unitprice), MIN(offers.unitprice), 0, SUM(offers.totalselling) FROM generate_series('2016-01-01 00:00'::timestamp,current_date, '1 day') timeframe(date) LEFT OUTER JOIN (SELECT ao.totalselling, ao.unitprice, createtx.TXRecvTime as createdate, COALESCE(lasttx.TXRecvTime,createtx.TXRecvTime) as solddate from ActiveOffers ao inner join Transactions createtx on ao.CreateTXDBSerialNum = createtx.TxDBSerialNum left outer join Transactions lasttx on ao.LastTXDBSerialNum = lasttx.TxDBSerialNum where ao.OfferState = 'sold' and ao.PropertyIdSelling = %s and ao.PropertyIdDesired = %s ORDER BY createtx.TXRecvTime) offers on DATE(offers.createdate) <= timeframe.date and DATE(offers.solddate) >= timeframe.date group by timeframe.date",[propertyid_selling, propertyid_desired])
    return jsonify({"status" : 200, "orderbook": [
        {
            "date":order[0], 
            "open":order[1] if order[1] is not None else 0,
            "high" : str(order[2]) if order[2] is not None else 0,
            "low" : str(order[3]) if order[3] is not None else 0,
            "close" : str(order[4]) if order[4] is not None else 0 or 0,
            "volume": str(order[5]) if order[5] is not None else 0
        } for order in orderbook]})


@app.route('/<int:propertyid_desired>/<int:propertyid_selling>')
def get_orders_by_market(propertyid_desired, propertyid_selling):
    orderbook = dbSelect("select ao.propertyiddesired, ao.propertyidselling, ao.AmountAvailable, ao.AmountDesired, ao.TotalSelling, ao.AmountAccepted, txj.txdata->'unitprice', ao.Seller, tx.TxRecvTime from activeoffers ao, transactions tx, txjson txj where ao.CreateTxDBSerialNum = txj.TxDBSerialNum and ao.CreateTxDBSerialNum = tx.TxDBSerialNum and ao.propertyiddesired = %s and ao.propertyidselling = %s and ao.OfferState = 'active';",[propertyid_desired,propertyid_selling])
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
            "time" : order[8]
        } for order in orderbook]})
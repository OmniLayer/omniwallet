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


@app.route('/<int:propertyid_desired>')
def get_markets_by_propertyid_desired(propertyid_desired):
    markets = dbSelect("select distinct ao.propertyidselling, sp.propertyname from activeoffers ao inner join SmartProperties sp on ao.propertyidselling = sp.propertyid and sp.protocol = 'Omni' where ao.propertyiddesired = %s  order by sp.propertyname;",[propertyid_desired])
    return jsonify({"status" : 200, "markets": [
    	{
    		"propertyid":currency[0], 
    		"propertyname" : currency[1] 
		} for currency in markets]})

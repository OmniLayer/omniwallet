from flask import Flask, request, jsonify, abort, json, make_response

app = Flask(__name__)
app.debug = True



@app.route('/designatingcurrencies', methods=['POST'])
def getDesignatingCurrencies():
	ecosystem = re.sub(r'\W+', '', request.form["ecosystem"]) #check alphanumeric
	designating_currencies = dbSelect("select distinct ao.propertyiddesired, sp.propertyname from activeoffers ao inner join SmartProperties sp on ao.propertyiddesired = sp.propertyid and sp.ecosystem = %s where ao.propertyidselling not in (1, 2, 31)  order by ao.propertyiddesired ",[ecosystem])

	return jsonify({"status" : 200, "currencies": designating_currencies})
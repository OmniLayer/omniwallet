import urlparse
import os, sys, re
import time
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

#tools_dir = os.environ.get('TOOLSDIR')
#lib_path = os.path.abspath(tools_dir)
#sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

HISTORY_COUNT_CACHE = {}

@app.route('/categories', methods=['POST'])
def categories():
    categories_file = data_dir_root + "/www/categories.json"
    with open(categories_file, 'r') as f:
        try:
            categories = json.loads(f.read())
        except ValueError:
            print 'Error decoding JSON', categories_file.split('/')[-1][:-5]
    
    data = categories.keys()
    
    response = {
                'status' : 'OK',
                'categories' : data
                }

    return jsonify(response)

@app.route('/subcategories', methods=['POST'])
def subcategories():
    try:
        category = request.form['category']
    except KeyError:
        abort(make_response('No field \'category\' in request, request failed', 400))
    
    categories_file = data_dir_root + "/www/categories.json"
    with open(categories_file, 'r') as f:
        try:
            categories = json.loads(f.read())
        except ValueError:
            print 'Error decoding JSON', categories_file.split('/')[-1][:-5]
    
    try:
        data = categories[category]
    except KeyError:
        abort(make_response('Unexisting category, request failed', 400))
          
    response = {
                'status' : 'OK',
                'subcategories' : data
                }

    return jsonify(response)

@app.route('/list', methods=['POST'])
def list():
    query = ""
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
    try:
        issuer = re.sub(r'\D+', '', request.form['issuer_address']) #check alphanumeric
        query += " AND issuer='" + str(issuer) + "'"
    except KeyError:
        issuer = ""
    
    ROWS= dbSelect("select * from smartproperties where PropertyID > 2 AND ecosystem=%s%s ORDER BY PropertyName,PropertyID", (ecosystem,query))
    data=[]
    for property in ROWS:
        data.append({"currencyId":property[1],"propertyName":property[6]}) #get the json representation
        
    response = {
                'status' : 'OK',
                'properties' : data
                }

    return jsonify(response)

@app.route('/listactivecrowdsales', methods=['POST'])
def listcrowdsales():
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

    ROWS= dbSelect("select PropertyData from smartproperties where PropertyData::json->>'fixedissuance'='false' AND PropertyData::json->>'active'='true' AND ecosystem=%s ORDER BY PropertyName,PropertyID", [ecosystem])
    data=[row[0] for row in ROWS]
    
    response = {
                'status' : 'OK',
                'crowdsales' : data
                }

    return jsonify(response)

@app.route('/getdata/<int:property_id>')
def getdata(property_id):
    property=dbSelect("select PropertyData from smartproperties where PropertyID=%s and Protocol!='Fiat'",[property_id])[0]
    return jsonify(property[0])

@app.route('/gethistory/<int:property_id>', methods=["POST"])
def gethistory(property_id):
    try:
        start = int(request.form['start'])
    except KeyError:
        abort(make_response('No field \'start\' in request, request failed', 400))
    except ValueError:
        abort(make_response('Field \'start\' must be an integer, request failed', 400))
        
    try:
        count = int(request.form['count'])
    except KeyError:
        abort(make_response('No field \'count\' in request, request failed', 400))
    except ValueError:
        abort(make_response('Field \'count\' must be an integer, request failed', 400))

    
    transactions_query = "select txjson.txdata as data from propertyhistory ph, txjson where ph.txdbserialnum =txjson.txdbserialnum and ph.propertyid=%s order by ph.txdbserialnum LIMIT %s OFFSET %s;"
    total_query = "select count(*) as total from propertyhistory where propertyid =%s group by propertyid"
    
    try:
        cache=HISTORY_COUNT_CACHE[str(property_id)]
        if(time.time()-cache[1] > 6000000):
            total=dbSelect(total_query,[property_id])[0][0]
            HISTORY_COUNT_CACHE[str(property_id)] = (total, time.time())
        else:
            total=cache[0]    
    except KeyError:
        total=dbSelect(total_query,[property_id])[0][0]
        HISTORY_COUNT_CACHE[str(property_id)] = (total, time.time())
    
    
    ROWS=dbSelect(transactions_query,(property_id,count,start))
    transactions=[row[0] for row in ROWS]
    
    response = {
                "total" : total,
                "transactions" : transactions
                }
    return jsonify(response)



@app.route('/info', methods=['POST'])
def info():
    try:
        property_ = request.form['property']
    except KeyError:
        abort(make_response('No field \'property\' in request, request failed', 400))

    try:
        property_ = json.loads(property_)
    except ValueError:
        abort(make_response('This endpoint only consumes valid JSON', 400))

    if type(property_) != type([]) or len(property_) == len([]):
        abort(make_response('Please provide data in a JSON array for processing, request failed', 400))

    for prop in property_:
        if type(prop) != type(0):
            abort(make_response('Array data must be of type int', 400))
        #property_ = map(( lambda prop_: re.sub('\D','', prop_ ) ), property_ )

    data = filterProperties(property_)

    response={ 
        'status': data[0], 
        'data': data[1]
        }

    #DEBUG print response
    return jsonify(response)

# refactor this to be compatible with mastercored
def filterProperties( properties ):
    import glob

    addresses = glob.glob(data_dir_root + '/addr/*')
    addresses_data = []
    for prop in properties:
        for address_file in addresses:
            #print address[-5:]
            if address_file[-5:] == '.json':
                with open( address_file , 'r' ) as f:
                  try:
                    addr = json.loads(f.readline())

                    if str(prop) in addr:
                      addresses_data.append({ 'address': address_file.split('/')[-1][:-5], 'data': addr[str(prop)] })
                  except ValueError:
                    print 'Error decoding JSON', address_file.split('/')[-1][:-5]
    
    return ['OK',addresses_data]

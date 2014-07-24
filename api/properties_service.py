import urlparse
import os, sys, re
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

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
    try:
        ecosystem = request.form['ecosystem']
    except KeyError:
        abort(make_response('No field \'ecosystem\' in request, request failed', 400))
    
       
    data = listProperties(ecosystem)
    response = {
                'status' : 'OK',
                'properties' : data
                }

    return jsonify(response)

@app.route('/listactivecrowdsales', methods=['POST'])
def listcrowdsales():
    try:
        ecosystem = request.form['ecosystem']
    except KeyError:
        abort(make_response('No field \'ecosystem\' in request, request failed', 400))
    
       
    host = RPCHost()
    try:
        list = host.call("getactivecrowdsales_MP")['result']
        data = [ crowdsale for crowdsale in list if (ecosystem == "1" and crowdsale['propertyid'] < 2147483651) or (ecosystem == "2" and crowdsale['propertyid'] >= 2147483651)]
    except Exception,e:
        #Properties not found
        data= []  
        
    response = {
                'status' : 'OK',
                'crowdsales' : data
                }

    return jsonify(response)

@app.route('/getdata/<int:property_id>')
def getdata(property_id):
    host = RPCHost()
    try:
        property = host.call("getproperty_MP", property_id)['result']
    except Exception,e:
        abort(make_response('Error getting property', 400))
        
    return jsonify(property)

@app.route('/getcrowdsale/<int:property_id>')
def getcrowdsale(property_id):
    host = RPCHost()
    try:
        crowdsale = host.call("getcrowdsale_MP", property_id, True)['result']
    except Exception,e:
        abort(make_response('Error getting crowdsale', 400))
    
    history = crowdsale.pop("participanttransactions", [])    
    crowdsale["participanttokens"] = sum([tx.participanttokens for tx in history])
    crowdsale["issuertokens"] = sum([tx.issuertokens for tx in history])
    
    return jsonify(crowdsale)

@app.route('/getcrowdsalehistory/<int:property_id>', methods=["POST"])
def getcrowdsalehistory(property_id):
    try:
        start = request.form['start']
    except KeyError:
        abort(make_response('No field \'start\' in request, request failed', 400))
        
    try:
        count = request.form['count']
    except KeyError:
        abort(make_response('No field \'count\' in request, request failed', 400))
    
    host = RPCHost()
    try:
        crowdsale = host.call("getcrowdsale_MP", property_id, True)['result']
    except Exception,e:
        abort(make_response('Error getting crowdsale', 400))
    
    
    end = start + count if len(crowdsale['participanttransactions']) < start + count else -1
    
    response = {
                "total" : len(crowdsale['participanttransactions']),
                "transactions" : crowdsale['participanttransactions'][start:end]
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


def listProperties(ecosystem):
    #===========================================================================
    # mastercoin-tools reference
    # import glob
    # 
    # properties = glob.glob(data_dir_root +'/properties/*')
    # properties_data = []
    # for property_file in properties:
    #     if property_file[-5:] == '.json':
    #         with open(property_file, 'r') as f:
    #             try:
    #                 prop = json.loads(f.readline())[0]
    #                 if prop["formatted_ecosystem"] == int(ecosystem): properties_data.append(prop)
    #             except ValueError:
    #                 print 'Error decoding JSON', property_file.split('/')[-1][:-5]        
    #============================================================================
    
    host=RPCHost()
    try:
        properties_list= host.call("listproperties_MP")['result']
        properties_data = [ property for property in properties_list if (ecosystem == "1" and property['propertyid'] < 2147483651) or (ecosystem == "2" and property['propertyid'] >= 2147483651)]
    except Exception,e:
        #Properties not found
        properties_data= []  
    
    
    
    return properties_data

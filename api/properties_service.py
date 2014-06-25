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
            categories = json.loads(f.read())[0]
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
            categories = json.loads(f.read())[0]
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
    try:
        issuer = request.form['issuer_address']
    except KeyError:
        issuer = ""
    
       
    data = listProperties(ecosystem)
    if issuer != "":
        data = [property for property in data if property["from_address"] == issuer]
    response = {
                'status' : 'OK',
                'properties' : data
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


# refactor this to be compatible with mastercored
def listProperties(ecosystem):
    import glob
    
    properties = glob.glob(data_dir_root +'/properties/*')
    properties_data = []
    for property_file in properties:
        if property_file[-5:] == '.json':
            with open(property_file, 'r') as f:
                try:
                    prop = json.loads(f.readline())[0]
                    if prop["formatted_ecosystem"] == int(ecosystem): properties_data.append(prop)
                except ValueError:
                    print 'Error decoding JSON', property_file.split('/')[-1][:-5]        
                         
    return properties_data
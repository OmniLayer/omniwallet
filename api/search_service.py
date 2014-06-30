import urlparse
import os, sys, re
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *
import glob, json

tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

@app.route('/', methods=['GET'])
def search():
    if 'query' in request.args:
        query = re.sub(r'\W+', '0', request.args.get('query') ) # strip and get query
    else:
        return jsonify({ 'status': 400, 'data': 'No query found in request' })



    data=glob.glob(data_dir_root + '/tx/*')

    newdata=[]
    for each in data:
        if each[-4:] == 'json':
            removedjson = each.split('.')[0]
            txhash = removedjson.split('/')[-1]
            if len(re.findall(query, txhash)) > 0: 
                newdata.append(json.loads(open(data_dir_root+'/tx/'+txhash+'.json').readline())[0])

    return jsonify({ 'status': 200, 'data': newdata })

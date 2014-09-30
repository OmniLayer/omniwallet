import urlparse
import os, sys, pybitcointools, bitcoinrpc, getpass
#import psycopg2, psycopg2.extras
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_obelisk import *
from sqltools import *

http_status = '200 OK'

def getRPCconn():
    USER=getpass.getuser()
    conn = bitcoinrpc.connect_to_local()
    try:
    	conn.getblockcount()
    except StandardError:
    	try:
            with open('/home/'+USER+'/.bitcoin/bitcoin.conf') as fp:
                RPCPORT="8332"
                RPCHOST="localhost"
                for line in fp:
                    #print line
                    if line.split('=')[0] == "rpcuser":
                    	RPCUSER=line.split('=')[1].strip()
                    elif line.split('=')[0] == "rpcpassword":
                    	RPCPASS=line.split('=')[1].strip()
                    elif line.split('=')[0] == "rpcconnect":
                    	RPCHOST=line.split('=')[1].strip()
                    elif line.split('=')[0] == "rpcport":
                    	RPCPORT=line.split('=')[1].strip()
		    elif line.split('=')[0] == "rpcssl":
                        if line.split('=')[1].strip() == "1":
			    RPCSSL="True"
			else:
			    RPCSSL="False"
    	except IOError as e:
            response='{"error": "Unable to load bitcoin config file. Please Notify Site Administrator"}'
            return response
        try:
            conn = bitcoinrpc.connect_to_remote(RPCUSER,RPCPASS,host=RPCHOST,port=RPCPORT,use_https=RPCSSL)
     	except StandardError:
            response='{"error": "Connection to bitcoind server unavailable. Please try agian in 5 minutes"}'
            return response
    return conn

def response_with_error(start_response, environ, response_body):
    headers = [('Content-type', 'application/json')]
    start_response(http_status, headers)
    response='{"error":"'+response_body+'"}'
    return response

def general_handler(environ, start_response, response_dict_to_response_func):
    path    = environ['PATH_INFO']
    method  = environ['REQUEST_METHOD']
    http_status = 'invalid'
    response_status='OK'
    if method != 'POST':
        return response_with_error(start_response, environ, 'No POST')
    else:
        try:
            request_body_size = int(environ['CONTENT_LENGTH'])
            request_body = environ['wsgi.input'].read(request_body_size)
        except (TypeError, ValueError):
            return response_with_error(start_response, environ, 'Bad environ in POST')
        try:
            response_dict=urlparse.parse_qs(request_body)
        except (TypeError, ValueError):
            return response_with_error(start_response, environ, 'Bad urlparse')

        (response, error)=response_dict_to_response_func(response_dict)
        if error != None:
            return response_with_error(start_response, environ, error)

        headers = [('Content-type', 'application/json')]
        start_response(http_status, headers)
        return response

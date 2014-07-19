import urlparse
import os, sys, pybitcointools, bitcoinrpc, getpass
import requests
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_obelisk import *

http_status = '200 OK'

class RPCHost():
    def __init__(self):
        USER=getpass.getuser()
        self._session = requests.Session()
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
                            RPCSSL=True
                        else:
                            RPCSSL=False
        except IOError as e:
            response='{"error": "Unable to load bitcoin config file. Please Notify Site Administrator"}'
            return response
        if RPCSSL:
            self._url = "https://"+RPCUSER+":"+RPCPASS+"@"+RPCHOST+":"+RPCPORT
        else:
            self._url = "http://"+RPCUSER+":"+RPCPASS+"@"+RPCHOST+":"+RPCPORT
        self._headers = {'content-type': 'application/json'}
    def call(self, rpcMethod, *params):
        payload = json.dumps({"method": rpcMethod, "params": list(params), "jsonrpc": "2.0"})
        tries = 10
        hadConnectionFailures = False
        while True:
            try:
                response = self._session.get(self._url, headers=self._headers, data=payload, verify=False)
            except requests.exceptions.ConnectionError:
                tries -= 1
                if tries == 0:
                    raise Exception('Failed to connect for remote procedure call.')
                hadFailedConnections = True
                print("Couldn't connect for remote procedure call, will sleep for ten seconds and then try again ({} more tries)".format(tries))
                time.sleep(10)
            else:
                if hadConnectionFailures:
                    print('Connected for remote procedure call after retry.')
                break
        if not response.status_code in (200, 500):
            raise Exception('RPC connection failure: ' + str(response.status_code) + ' ' + response.reason)
        responseJSON = response.json()
        if 'error' in responseJSON and responseJSON['error'] != None:
            raise Exception('Error in RPC call: ' + str(responseJSON['error']))
        #return responseJSON['result']
        return responseJSON

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
            response='{"error": "Connection to bitcoind server unavailable. Please try again in 5 minutes"}'
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

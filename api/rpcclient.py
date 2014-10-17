import requests, getpass
import time, json

class RPCHost():
    def __init__(self):
        USER=getpass.getuser()
        self._session = requests.Session()
        try:
            with open('/home/'+USER+'/.bitcoin/bitcoin.conf') as fp:
                RPCPORT="8332"
                RPCHOST="localhost"
                RPCSSL=False
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
            raise Exception('Error in ' + rpcMethod + ' RPC call: ' + str(responseJSON['error']))
        #return responseJSON['result']
        return responseJSON



#Define / Create RPC connection
host=RPCHost()

#Bitcoin Generic RPC calls
def getinfo():
    return host.call("getinfo")

def getrawtransaction(txid):
    return host.call("getrawtransaction", txid , 1)

def getblockhash(block):
    return host.call("getblockhash", block)

def getblock(hash):
    return host.call("getblock", hash)

def sendrawtransaction(tx):
    try:
      return host.call("sendrawtransaction", tx)
    except Exception, e:
      return e

## Mastercoin Specific RPC calls
def getbalance_MP(addr, propertyid):
    return host.call("getbalance_MP", addr, propertyid)

def getallbalancesforaddress_MP(addr):
    return host.call("getallbalancesforaddress_MP", addr)

def getallbalancesforid_MP(propertyid):
    return host.call("getallbalancesforid_MP", propertyid)

def gettransaction_MP(tx):
    return host.call("gettransaction_MP", tx)

def listblocktransactions_MP(height):
    return host.call("listblocktransactions_MP", height)

def getproperty_MP(propertyid):
    return host.call("getproperty_MP", propertyid)

def listproperties_MP():
    return host.call("listproperties_MP")

def getcrowdsale_MP(propertyid):
    return host.call("getcrowdsale_MP", propertyid)

def getactivecrowdsales_MP():
    return host.call("getactivecrowdsales_MP")

def getactivedexsells_MP():
    return host.call("getactivedexsells_MP")

def getdivisible_MP(propertyid):
    return getproperty_MP(propertyid)['result']['divisible']

def getgrants_MP(propertyid):
    return host.call("getgrants_MP", propertyid)

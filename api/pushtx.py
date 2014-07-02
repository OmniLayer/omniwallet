import urlparse
import os, sys,re
tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_parsing import *
from msc_apps import *
import tempfile

sys.path.append(os.path.abspath("../lib"))
from stats_backend import StatsBackend

def pushtx_response(response_dict):
    expected_fields=['signedTransaction']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
            
    signed_tx=response_dict['signedTransaction'][0]
    
    response=pushtxnode(signed_tx)
    print signed_tx,'\n', response
    return (response, None)

def pushtxnode(signed_tx):
    import commands, json
    signed_tx = re.sub(r'\W+', '', signed_tx) #check alphanumeric
    output=commands.getoutput('bitcoind sendrawtransaction ' +  str(signed_tx) )
    
    ret=re.findall('{.+',output)
    if len(ret) > 0:
        output=json.loads(ret[0])

        response_status='NOTOK'
        response=json.dumps({"status":response_status, "pushed": output['message'], "code": output['code'] })
        response=json.dumps(output)
    else:
        response_status='OK'
        response=json.dumps({"status":response_status, "pushed": 'success', "tx": output })

    print response
    return response

def pushtx(signed_tx):
    info(signed_tx)

    f = tempfile.NamedTemporaryFile(mode='r+b',prefix='signedtx-', delete=False, dir='/var/lib/omniwallet/tmptx')
    f.write(signed_tx)
    f.close()

    # validate tx first
    ret=validate_tx(f.name)
    if ret != None:
        return ret
    
    # broadcast
    ret=broadcast_tx(f.name)
    if ret != None:
        return ret
    else:
        stats = StatsBackend()
        stats.increment("amount_of_transactions")
        return 'success'

def pushtx_handler(environ, start_response):
    return general_handler(environ, start_response, pushtx_response)

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

error_codez= {
 '-1': 'Exception thrown. Contact a developer.',
 '-2': 'Server is in safe mode. Contact a developer.',
 '-3': 'Unexpected type. Contact a developer.',
 '-5': 'Invalid address or key. Contact a developer.',
 '-7': 'Out of memory. Contact a developer.',
 '-8': 'Invalid parameter. Contact a developer.',
 '-20': 'Database error. Contact a developer.',
 '-22': 'Error parsing transaction. Contact a developer.',
 '-25': 'General error. Contact a developer.',
 '-26': 'Transaction rejected by the network. Contact a developer.',
 '-27': 'Transaction already in chain. Contact a developer.',
 '1': 'Transaction malformed. Contact a developer.',
 '16': 'Transaction was invalid. Contact a developer.',
 '65': 'Transaction sent was under dust limit. Contact a developer.',
 '66': 'Transaction did not meet fees. Contact a developer.',
 '69.2': 'Your hair is on fire. Contact a stylist.'
}


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
    #output=commands.getoutput('bitcoind sendrawtransaction ' +  str(signed_tx) )
    output=sendrawtransaction(str(signed_tx))

    ret=re.findall('{.+',str(output))
    if 'code' in ret[0]:
        try:
          output=json.loads(ret[0])
        except TypeError:
          output=ret[0]
        except ValueError:
          #reverse the single/double quotes and strip leading u in output to make it json compatible
          output=json.loads(ret[0].replace("'",'"').replace('u"','"'))

        response_status='NOTOK'
        try:
            response=json.dumps({"status":response_status, "pushed": error_codez[ str(output['code']) ], "message": output['message'], "code": output['code'] })
        except KeyError, e:
            response=json.dumps({"status":response_status, "pushed": str(e), "message": output['message'], "code": output['code'] })
    else:
        response_status='OK'
        response=json.dumps({"status":response_status, "pushed": 'success', "tx": output['result'] })

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

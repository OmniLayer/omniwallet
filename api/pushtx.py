import urlparse
import os, sys,re
#tools_dir = os.environ.get('TOOLSDIR')
#lib_path = os.path.abspath(tools_dir)
#sys.path.append(lib_path)
#from msc_utils_parsing import *
from msc_apps import *
from pending import *
#import tempfile

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
 '-26': 'Transaction rejected by the network.',
 '-27': 'Transaction already in chain. Contact a developer.',
 '1': 'Transaction malformed. Contact a developer.',
 '16': 'Transaction was invalid. Contact a developer.',
 '65': 'Transaction sent was under dust limit. Contact a developer.',
 '66': 'Transaction did not meet fees. Try increasing Miner Fee.',
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

    if "NOTOK" not in response:
      try:
        insertpending(signed_tx)
      except Exception as e:
        print "error inserting pending tx"+str(e)
    
    print signed_tx,'\n', response
    return (response, None)

def pushtxnode(signed_tx):
    import commands, json
    signed_tx = re.sub(r'\W+', '', signed_tx) #check alphanumeric
    #output=commands.getoutput('bitcoind sendrawtransaction ' +  str(signed_tx) )
    print "final signed", signed_tx
    output=sendrawtransaction(str(signed_tx))
    #output="Test output for error code handling: : {u'message': u'66: insufficient priority', u'code': -26}"

    print 'raw response',output,'\n'

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
          message=error_codez[ output['message'].split(":")[0] ]
        except:
          message=output['message']

        try:
          response=json.dumps({"status":response_status, "pushed": error_codez[ str(output['code']) ], "message": message, "code": output['code'] })
        except KeyError, e:
          response=json.dumps({"status":response_status, "pushed": str(e), "message": message, "code": output['code'] })
    else:
        response_status='OK'
        response=json.dumps({"status":response_status, "pushed": 'success', "tx": output['result'] })

    print response
    return response

def pushtx_handler(environ, start_response):
    return general_handler(environ, start_response, pushtx_response)

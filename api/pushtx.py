import urlparse
import os, sys
lib_path = os.path.abspath('..')
sys.path.append(lib_path)
from msc_utils_parsing import *
from msc_apps import *
import tempfile

def pushtx_response(response_dict):
    expected_fields=['signedTransaction']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
            
    signed_tx=response_dict['signedTransaction'][0]
    
    response_status='OK'
    pushed=pushtx(signed_tx)
    response='{"status":"'+response_status+'", "pushed":"'+pushed+'"}'
    return (response, None)

def pushtx(signed_tx):
    info(signed_tx)
    f = tempfile.NamedTemporaryFile(prefix='signedtx-', delete=True)
    f.write(signed_tx)

    # validate tx first
    ret=validate_tx(f.name)
    if ret != None:
        f.close()
        return ret

    # broadcast
    ret=broadcast_tx(f.name)
    f.close()
    if ret != None:
        return ret
    else:
        return 'success'

def pushtx_handler(environ, start_response):
    return general_handler(environ, start_response, pushtx_response)

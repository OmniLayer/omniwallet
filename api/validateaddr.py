import urlparse
import os, sys
lib_path = os.path.abspath('..')
sys.path.append(lib_path)
from msc_utils_obelisk import *
from msc_apps import *

def validateaddr_response(response_dict):
    try:
        addrs_list=response_dict['addr']
    except KeyError:
        return (None, 'No address in dictionary')
        
    if len(addrs_list)!=1:
        return response(None, 'No single address')
    addr=addrs_list[0]
    
    # now verify
    l=len(addr)
    info(l)
    if l == 66 or l == 130: # probably pubkey
        if is_pubkey_valid(addr):
            debug='valid pubkey'
            response_status='OK'
        else:
            debug='invalid pubkey'
            response_status='invalid pubkey'
    else:   
        if not is_valid_bitcoin_address(addr):
            debug='invalid address'
            response_status='invalid address'
        else:
            addr_pubkey=get_pubkey(addr)
            if is_pubkey_valid(addr_pubkey):
                debug='valid address'
                response_status='OK'
            else:
                debug='missing pubkey'
                response_status='missing pubkey'
    response='{"status":"'+response_status+'", "debug":"'+debug+'"}'
    return (response, None)

def validateaddr_handler(environ, start_response):
    return general_handler(environ, start_response, validateaddr_response)

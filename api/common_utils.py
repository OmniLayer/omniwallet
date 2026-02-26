import hashlib
import re
from ecdsa import curves, ecdsa
# Source https://github.com/warner/python-ecdsa
from pycoin import encoding
# Source https://github.com/richardkiss/pycoin
import subprocess
import simplejson


__b58chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
__b58base = len(__b58chars)

def formatted_decimal(float_number):
    s=str("{0:.8f}".format(float_number))
    if s.strip('0.') == '':      # only zero and/or decimal point
        return '0.0'
    else:
        trimmed=s.rstrip('0')     # remove zeros on the right
        if trimmed.endswith('.'): # make sure there is at least one zero on the right
            return trimmed+'0'
        else:
            if trimmed.find('.')==-1:
                return trimmed+'.0'
            else:
                return trimmed

def to_satoshi(value):
    return int(float(value)*100000000+0.5)

def from_satoshi(value):
    float_number=int(value)/100000000.0
    return formatted_decimal(float_number)

def bc_address_to_hash_160(addr):
    vh160_with_checksum=b58decode(addr, 25)
    return vh160_with_checksum[1:-4]

def hash_160_to_bc_address(h160):
    vh160 = '\x00'+h160 # \x00 is version 0
    h3=hashlib.sha256(hashlib.sha256(vh160).digest()).digest()
    addr=vh160+h3[0:4]
    return b58encode(addr)

def b58decode(v, length):
    """ decode v into a string of len bytes """
    long_value = 0L
    for (i, c) in enumerate(v[::-1]):
      long_value += __b58chars.find(c) * (__b58base**i)
    result = ''
    while long_value >= 256:
        div, mod = divmod(long_value, 256)
        result = chr(mod) + result
        long_value = div
    result = chr(long_value) + result
    nPad = 0
    for c in v:
        if c == __b58chars[0]: nPad += 1
        else: break
    result = chr(0)*nPad + result
    if length is not None and len(result) != length:
        return None
    return result

def b58encode(v):
    """ encode v, which is a string of bytes, to base58. """
    long_value = 0L
    for (i, c) in enumerate(v[::-1]):
        long_value += (256**i) * ord(c)
    result = ''
    while long_value >= __b58base:
        div, mod = divmod(long_value, __b58base)
        result = __b58chars[mod] + result
        long_value = div
    result = __b58chars[long_value] + result
    # Bitcoin does a little leading-zero-compression:
    # leading 0-bytes in the input become leading-1s
    nPad = 0
    for c in v:
        if c == '\0': nPad += 1
        else: break
    return (__b58chars[0]*nPad) + result

def get_bcaddress_version(address):
  """ Returns None if address is invalid. Otherwise returns integer version of address. """
  addr = b58decode(address,25)
  if addr is None: return None
  version = addr[0]
  checksum = addr[-4:]
  vh160 = addr[:-4] # Version plus hash160 is what is checksummed
  h3=hashlib.sha256(hashlib.sha256(vh160).digest()).digest()
  if h3[0:4] == checksum:
      return ord(version)
  return None

## General

def error(msg):
    print '[E] '+str(msg)
    exit(1)

def info(msg):
    print '[I] '+str(msg)

def debug(msg):
    if msc_globals.d == True:
      print '[D] '+str(msg)

def get_string_xor(s1,s2):
    result = int(s1, 16) ^ int(s2, 16)
    return '{:x}'.format(result)


#remove unicode
def dehexify(hex_str):
    temp_str=[]
    for let in hex_str:
        if ord(let) < 128:
            temp_str.append(let)
        else:
            temp_str.append('?')
    return ''.join(temp_str)

def get_obfus_str_list(address, length):
    obfus_str_list=[]
    obfus_str_list.append(get_sha256(address)) # 1st obfus is simple sha256
    for i in range(length):
        if i<length-1: # one less obfus str is needed (the first was not counted)
            obfus_str_list.append(get_sha256(obfus_str_list[i].upper())) # i'th obfus is sha256 of upper prev
    return obfus_str_list

import hashlib
import os
from time import gmtime, strftime
import datetime
import random

# Time calculations from http://stackoverflow.com/a/11111177/364485
def unix_time(dt):
  epoch = datetime.datetime.utcfromtimestamp(0)
  delta = dt - epoch
  return delta.total_seconds()

def unix_time_millis(dt):
  return unix_time(dt) * 1000.0
######

def generate_salt( uuid ):
  secret = os.environ[ 'OMNIWALLET_SECRET' ]
  m = hashlib.sha256()
  m.update( uuid + secret )
  return m.hexdigest()

def generate_challenge():
  return str( unix_time( datetime.datetime.now() )) + str( random.random() )

def validate_nonce( nonce, challenge ):
  m = hashlib.sha256()
  m.update( str( nonce ) + str( challenge) )

  return m.hexdigest().endswith( '0400' )

def check_signature( signedJson, pubkey ):
  return True

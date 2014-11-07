import urlparse
import os, sys, tempfile, json
import glob,time
from msc_apps import *
from decimal import *

def orders_response(response_dict):
    maxblock=dbSelect("select max(blocknumber) from orderblob")[0][0]
    orders=json.loads(dbSelect("select orders from orderblob where blocknumber=%s",[maxblock])[0][0])

    return (orders, None)

def orders_handler(environ, start_response):
    return general_handler(environ, start_response, orders_response)

import json
import os
import platform
import sys

path = os.path.dirname(os.path.abspath(os.path.realpath(__file__))) + "/../lib/"
sys.path.append(path)
from stats_backend import StatsBackend

def generate_stats():
  stats = StatsBackend()

  # 1. Count the amount of wallets
  if platform.system() == "Darwin": # This could be removed at one point, just here for development
    wallet_path = "/tmp/wallets"
  else:
    wallet_path = "/var/lib/omniwallet/wallets"
  try:
    wallet_files = os.listdir(wallet_path)
    amount_of_wallets = len(wallet_files)
  except IOError as e:
    print "Error retrieving wallets: %s" % e

  stats.put("amount_of_wallets", amount_of_wallets)

  # 2. Count the amount of watch-only and full addresses, we could split this at one point
  #address_count = 0 
  #for wallet in wallet_files:
  #  try:
  #    f = open("%s/%s" % (wallet_path, wallet))
  #    accounts = json.loads(f.read())
  #    address_count += len(accounts["addresses"])
  #  except IOError as e:
  #    print "File could not be read for %s" % wallet
  #  except ValueError as e:
  #    print "JSON Could not be decoded for %s" % wallet

  #stats.put("amount_of_addresses_managed", address_count)

generate_stats()

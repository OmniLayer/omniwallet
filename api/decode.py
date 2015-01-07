from flask import Flask, abort, json, jsonify
import hashlib
import pybitcointools
from decimal import *
from rpcclient import *

app = Flask(__name__)
app.debug = True

@app.route('/<rawhex>')
def decode(rawhex):

  transaction = decoderawtransaction(rawhex)['result']
  senders = getrawtransaction(transaction['vin'][0]['txid'])['result']['vout'][transaction['vin'][0]['vout']]['scriptPubKey']['addresses']
  reference = senders[0]

  #get all multisigs
  multisig_output = []
  for output in transaction['vout']:
    if output['scriptPubKey']['type'] == 'multisig':
      multisig_output.append(output) #grab msigs

  #extract compressed keys
  scriptkeys = []
  for output in multisig_output:   #seqnums start at 1, so adjust range
    split_script = output['scriptPubKey']['asm'].split(' ')
    for val in split_script:
        if len(val) == 66:
            scriptkeys.append(val)

  #filter keys that are ref
  nonrefkeys = []
  for compressedkey in scriptkeys:
    if pybitcointools.pubtoaddr(compressedkey) not in senders :
        nonrefkeys.append(compressedkey)

  max_seqnum = len(nonrefkeys)
  sha_keys = [ hashlib.sha256(reference).digest().encode('hex').upper()]  #first sha256 of ref addr, see class B for more info
  for i in range(max_seqnum):
    if i < (max_seqnum-1):
        sha_keys.append(hashlib.sha256(sha_keys[i]).digest().encode('hex').upper()) #keep sha'ing to generate more packets

  pairs = []
  for i in range(len(nonrefkeys)):
    pairs.append((nonrefkeys[i], sha_keys[i] ))

  packets = []
  for pair in pairs:
    obpacket = pair[0].upper()[2:-2]
    shaaddress = pair[1][:-2]
    print 'Obfus/SHA', obpacket, shaaddress
    datapacket = ''
    for i in range(len(obpacket)):
        if obpacket[i] == shaaddress[i]:
            datapacket = datapacket + '0'
        else:
            bin_ob = int('0x' + obpacket[i], 16)
            bin_sha = int('0x' + shaaddress[i], 16)
            xored = hex(bin_ob ^ bin_sha)[2:].upper()
            datapacket = datapacket + xored
    packets.append(datapacket)

  long_packet = ''
  for packet in packets:
    print 'Decoded packet #' + str(packet[0:2]) + ' : ' + packet
    long_packet += packet[2:]


  retval = {"Error":"Can\'t decode tx"}
  if long_packet[4:8] == '0032':
    #Create Fixed Issuance
    spare_bytes = ''.join(long_packet[22:])
    #DEBUG print spare_bytes.split('00')
    len_var_fields = len(''.join(spare_bytes.split('00')[0:5])+'0000000000')
    #DEBUG print len_var_fields, spare_bytes[len_var_fields:len_var_fields+16],spare_bytes

    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Ecosystem': int(long_packet[8:10],16),
               'Property Type': int(long_packet[10:14],16),
               'Previous Property ID': int(long_packet[14:22],16),
               'Property Category': spare_bytes.split('00')[0].decode('hex'),
               'Property Subcategory': spare_bytes.split('00')[1].decode('hex'),
               'Property Name': spare_bytes.split('00')[2].decode('hex'),
               'Property URL':  spare_bytes.split('00')[3].decode('hex'),
               'Property Data':  ''.join(spare_bytes.split('00')[4]).decode('hex'),
               'Number of Properties: ': int(str(int(spare_bytes[len_var_fields:len_var_fields+16],16)))
             }

  if long_packet[4:8] == '0033':
    #Create Variable issuance (Crowdsale)
    spare_bytes = ''.join(long_packet[22:])
    #DEBUG print spare_bytes.split('00')
    len_var_fields = len(''.join(spare_bytes.split('00')[0:5])+'0000000000')
    #DEBUG print len_var_fields, spare_bytes[len_var_fields:len_var_fields+16],spare_bytes

    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Ecosystem': int(long_packet[8:10],16),
               'Property Type': int(long_packet[10:14],16),
               'Previous Property ID': int(long_packet[14:22],16),
               'Property Category': spare_bytes.split('00')[0].decode('hex'),
               'Property Subcategory': spare_bytes.split('00')[1].decode('hex'),
               'Property Name': spare_bytes.split('00')[2].decode('hex'),
               'Property URL':  spare_bytes.split('00')[3].decode('hex'),
               'Property Data':  ''.join(spare_bytes.split('00')[4]).decode('hex'),
               'Currency Identifier Desired': str(int(spare_bytes[len_var_fields:len_var_fields+8],16)),
               'Number of Properties': str(int(spare_bytes[len_var_fields+8:len_var_fields+8+16],16)),
               'Deadline': str(int(spare_bytes[len_var_fields+8+16:len_var_fields+8+16+16],16)),
               'Earlybird Bonus': str(int(spare_bytes[len_var_fields+8+16+16:len_var_fields+8+16+16+2],16)),
               'Percentage for Issuer': str(int(spare_bytes[len_var_fields+8+16+16+2:len_var_fields+8+16+16+2+2],16))
             }

  if long_packet[4:8] == '0000':
    #simple send
    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Currency Identifier': int(long_packet[8:16],16),
               'Amount Transfered': int(long_packet[16:32],16)
             }

  if long_packet[4:8] == '0035':
    #Close Crowdsale Manually
    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Currency Identifier': int(long_packet[8:16],16)
             }

  if long_packet[4:8] == '0037':
    #grant properties
    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Currency Identifier': int(long_packet[8:16],16),
               'Amount Created': int(long_packet[16:32],16)
             }

  if long_packet[4:8] == '0038':
    #revoke properties
    retval = { 'TxVersion': int(long_packet[0:4],16),
               'TxType': int(long_packet[4:8],16),
               'Currency Identifier': int(long_packet[8:16],16),
               'Amount Revoked': int(long_packet[16:32],16)
             }

  print  retval
  return jsonify({'MP':retval,'BTC':transaction})


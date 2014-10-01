import os
import sys
import random

tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
from msc_utils_parsing import *
from msc_apps import *

#data_dir_root = os.environ.get('DATADIR')


def accept_form_response(response_dict):
    expected_fields = ('buyer', 'amount', 'tx_hash', 'fee')
    for field in expected_fields:
        if field not in response_dict:
            return None, 'No field {} in response dict {} '.format(field, response_dict)
        if len(response_dict[field]) != 1:
            return None, 'Multiple values for field {}'.format(field)

    if 'pubKey' in response_dict and is_pubkey_valid(response_dict['pubKey'][0]):
        pubkey = response_dict['pubKey'][0]
        response_status = 'OK'
    else:
        pubkey = None
        response_status = 'invalid pubkey'

    buyer = response_dict['buyer'][0].strip()
    if not is_valid_bitcoin_address_or_pubkey(buyer):
        return None, 'Buyer is neither bitcoin address nor pubkey'

    amount = response_dict['amount'][0]
    if float(amount) < 0 or float(from_satoshi(amount)) > max_currency_value:
        return None, 'Invalid amount'

    tx_hash = response_dict['tx_hash'][0]
    if not is_valid_hash(tx_hash):
        return None, 'Invalid tx hash'

    fee = response_dict['fee'][0]
    if float(fee) < 0 or float(from_satoshi(fee)) > max_currency_value:
        return None, 'Invalid fee'

    if pubkey is None:
        tx_to_sign_dict = {'transaction': '','sourceScript':''}
        buyer_length = len(buyer)
        if buyer_length in (66, 130):  # probably pubkey
            if is_pubkey_valid(buyer):
                pubkey = buyer
                response_status = 'OK'
        else:
            if not is_valid_bitcoin_address(buyer):
                response_status = 'invalid address'
            else:
                buyer_pubkey = get_pubkey(buyer)
                if not is_pubkey_valid(buyer_pubkey):
                    response_status = 'missing pubkey'
                else:
                    pubkey = buyer_pubkey
                    response_status = 'OK'

    #DEBUG info(['early days', buyer, amount, tx_hash, fee])
    if pubkey is not None:
        tx_to_sign_dict = prepare_accept_tx_for_signing(pubkey, amount, tx_hash, fee)
    else:
        # minor hack to show error on page
        tx_to_sign_dict['sourceScript'] = response_status

    response = '{"status":"'+response_status+'", "transaction":"'+tx_to_sign_dict['transaction']+'", "sourceScript":"'+tx_to_sign_dict['sourceScript']+'"}'
    return response, None


def prepare_accept_tx_for_signing(buyer, amount, tx_hash, min_btc_fee=10000):

    # check if address or pubkey was given as buyer
    if buyer.startswith('0'): # a pubkey was given
        buyer_pub=buyer
        buyer=get_addr_from_key(buyer)
    else: # address was given
        buyer_pub=addrPub=get_pubkey(buyer)
        buyer_pub=buyer_pub.strip()

    # set change address to from address
    change_address_pub=buyer_pub
    changeAddress=buyer

    # get the amount in satoshi
    satoshi_amount=int( amount )

    # read json of orig tx to get tx details

    ROWS = dbSelect("select * from activeoffers ao, transactions t, txjson txj where t.txhash=%s "
                    "and ao.createtxdbserialnum=t.txdbserialnum and ao.createtxdbserialnum=txj.txdbserialnum", [txhash] )

    # sanity check
    if len(ROWS) == 0:
       error('no sell offer found for tx '+tx_hash)

    sell_offer_tx_dict=mapSchema( ROWS[0] )

    try:
        seller=sell_offer_tx_dict['from_address']
        formatted_amount_available=sell_offer_tx_dict['formatted_amount_available']
        formatted_bitcoin_amount_desired=sell_offer_tx_dict['formatted_bitcoin_amount_desired']
        formatted_fee_required=sell_offer_tx_dict['formatted_fee_required']
        currency_id=hex(sell_offer_tx_dict['currencyId'])[2:].zfill(8)
    except KeyError:
        error('missing field on tx '+tx_hash)

    #formatted_price_per_coin=sell_offer_tx_dict['formatted_price_per_coin']
    #formatted_block_time_limit=sell_offer_tx_dict['formatted_block_time_limit']

    # fee is max between min_btc_fee and required_fee
    required_fee=int( formatted_fee_required )
    satoshi_min_fee=int( min_btc_fee )
    fee=max(satoshi_min_fee,required_fee)

    required_value=4*dust_limit

    # get utxo required for the tx
    utxo_all=get_utxo(buyer, required_value+fee)
    utxo_split=utxo_all.split()
    inputs_number=len(utxo_split)/12
    inputs=[]
    inputs_total_value=0

    if inputs_number < 1:
        error('zero inputs')
    for i in range(inputs_number):
        inputs.append(utxo_split[i*12+3])
        try:
            inputs_total_value += int(utxo_split[i*12+7])
        except ValueError:
            error('error parsing value from '+utxo_split[i*12+7])

    inputs_outputs='/dev/stdout'
    for i in inputs:
        inputs_outputs+=' -i '+i

    # calculate change
    change_value=inputs_total_value-required_value-fee
    if change_value < 0:
        error ('negative change value')

    # sell accept - multisig
    # dust to exodus
    # dust to to_address
    # double dust to rawscript "1 [ change_address_pub ] [ dataHex_obfuscated ] 2 checkmultisig"
    # change to change
    tx_type=22 # 0x16 sell accept

    dataSequenceNum=1
    dataHex = '{:02x}'.format(0) + '{:02x}'.format(dataSequenceNum) + \
            '{:08x}'.format(tx_type) + currency_id + \
            '{:016x}'.format(satoshi_amount) + '{:06x}'.format(0)
    dataBytes = dataHex.decode('hex_codec')
    dataAddress = hash_160_to_bc_address(dataBytes[1:21])

    #DEBUG info(['later on', dataSequenceNum, tx_type, currency_id, satoshi_amount])
    # create the BIP11 magic
    
    change_address_compressed_pub=get_compressed_pubkey_format( change_address_pub )
    obfus_str=get_sha256(buyer)[:62]
    padded_dataHex=dataHex[2:]+''.zfill(len(change_address_compressed_pub)-len(dataHex))[2:]
    dataHex_obfuscated=get_string_xor(padded_dataHex,obfus_str).zfill(62)
    random_byte=hex(random.randrange(0,255)).strip('0x').zfill(2)
    hacked_dataHex_obfuscated='02'+dataHex_obfuscated+random_byte
    info('plain dataHex: --'+padded_dataHex+'--')
    info('obfus dataHex: '+hacked_dataHex_obfuscated)
    valid_dataHex_obfuscated=get_nearby_valid_pubkey(hacked_dataHex_obfuscated)
    info('valid dataHex: '+valid_dataHex_obfuscated)
    script_str='1 [ '+change_address_pub+' ] [ '+valid_dataHex_obfuscated+' ] 2 checkmultisig'
    info('change address is '+changeAddress)
    info('to_address is '+seller)
    info('total inputs value is '+str(inputs_total_value))
    info('fee is '+str(fee))
    info('dust limit is '+str(dust_limit))
    info('BIP11 script is '+script_str)
    dataScript=rawscript(script_str)

    inputs_outputs+=' -o '+exodus_address+':'+str(dust_limit) + \
                    ' -o '+seller+':'+str(dust_limit) + \
                    ' -o '+dataScript+':'+str(2*dust_limit)
    if change_value >= dust_limit:
        inputs_outputs+=' -o '+changeAddress+':'+str(change_value)
    else:
        # under dust limit leave all remaining as fees
        pass

    tx=mktx(inputs_outputs)
    info('inputs_outputs are '+inputs_outputs)
    info('parsed tx is '+str(get_json_tx(tx)))

    parse_dict=parse_multisig(tx)
    info(parse_dict)

    hash160=bc_address_to_hash_160(buyer).encode('hex_codec')
    prevout_script='OP_DUP OP_HASH160 ' + hash160 + ' OP_EQUALVERIFY OP_CHECKSIG'

    # tx, inputs
    return_dict={'transaction':tx, 'sourceScript':prevout_script}
    return return_dict

def mapSchema(row):
  rawdata = row[-1]

  #print row
  response = {
    'currencyId': rawdata['propertyid'],
    'formatted_amount_available': str( row[1] ),
    'formatted_bitcoin_amount_desired': str( row[2] ),
    'formatted_fee_required': str(row[3]),
    'from_address': rawdata['sendingaddress'],
  }

  return response

def accept_handler(environ, start_response):
    return general_handler(environ, start_response, accept_form_response)

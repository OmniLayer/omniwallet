import urlparse
import os, sys
lib_path = os.path.abspath('..')
sys.path.append(lib_path)
from msc_utils_parsing import *
from msc_apps import *
import random

def sell_form_response(response_dict):
    info(response_dict)
    expected_fields=['seller', 'amount', 'price', 'min_buyer_fee', 'fee', 'blocks', 'currency']
    for field in expected_fields:
        if not response_dict.has_key(field):
            return (None, 'No field '+field+' in response dict '+str(response_dict))
        if len(response_dict[field]) != 1:
            return (None, 'Multiple values for field '+field)
            
    seller=response_dict['seller'][0]
    if not is_valid_bitcoin_address_or_pubkey(seller):
        return (None, 'Buyer is neither bitcoin address nor pubkey')
    amount=response_dict['amount'][0]
    if float(amount)<0 or float(amount)>max_currency_value:
        return (None, 'Invalid amount')
    price=response_dict['price'][0]
    if float(price)<0 or float(price)>max_currency_value:
        return (None, 'Invalid price')
    min_buyer_fee=response_dict['min_buyer_fee'][0]
    if float(min_buyer_fee)<0 or float(min_buyer_fee)>max_currency_value:
        return (None, 'Invalid minimal buyer fee')
    fee=response_dict['fee'][0]
    if float(fee)<0 or float(fee)>max_currency_value:
        return (None, 'Invalid fee')
    blocks=int(response_dict['blocks'][0])
    if blocks<1 or blocks>max_payment_timeframe:
        return (None, 'Invalid payment timeframe')
    currency=response_dict['currency'][0]
    if currency=='MSC':
        currency_id=1
    else:
        if currency=='TMSC':
            currency_id=2
        else:
            return (None, 'Invalid currency')

    satoshi_price=to_satoshi(price)
    bitcoin_amount_desired=int(round(satoshi_price*float(amount)))

    pubkey='unknown'
    tx_to_sign_dict={'transaction':'','sourceScript':''}
    l=len(seller)
    if l == 66: # probably pubkey
        if is_pubkey_valid(seller):
            pubkey=seller
            response_status='OK'
        else:
            response_status='invalid pubkey'
    else:
        if not is_valid_bitcoin_address(seller):
            response_status='invalid address'
        else:
            seller_pubkey=get_pubkey(seller)
            if not is_pubkey_valid(seller_pubkey):
                response_status='missing pubkey'
            else:
                pubkey=seller_pubkey
                response_status='OK'
                tx_to_sign_dict=prepare_sell_tx_for_signing(seller, amount, bitcoin_amount_desired, min_buyer_fee, fee, blocks, currency_id)

    response='{"status":"'+response_status+'", "transaction":"'+tx_to_sign_dict['transaction']+'", "sourceScript":"'+tx_to_sign_dict['sourceScript']+'"}'
    return (response, None)

def prepare_sell_tx_for_signing(seller, amount, bitcoin_amount_desired, btc_min_buyer_fee, btc_fee, blocks, currency_id):

    # check if address or pubkey was given as seller
    if seller.startswith('0'): # a pubkey was given
        seller_pub=seller
        seller=get_addr_from_key(seller)
    else: # address was given
        seller_pub=addrPub=get_pubkey(seller)
        seller_pub=seller_pub.strip()

    # set change address to from address
    change_address_pub=seller_pub
    changeAddress=seller

    satoshi_amount=to_satoshi(amount)
    fee=to_satoshi(btc_fee)
    min_buyer_fee=to_satoshi(btc_min_buyer_fee)

    required_value=3*dust_limit

    # get utxo required for the tx
    utxo_all=get_utxo(seller, required_value+fee)
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

    # sell offer - multisig
    # dust to exodus
    # double dust to rawscript "1 [ change_address_pub ] [ dataHex_obfuscated ] [ dataHex2_obfuscated ] 3 checkmultisig"
    # change to change
    tx_type=20 # 0x14 sell offer

    dataSequenceNum=1
    dataHex_list=[]
    dataHex_list.append('{:02x}'.format(0) + '{:02x}'.format(dataSequenceNum) + \
            '{:08x}'.format(tx_type) + '{:08x}'.format(currency_id) + \
            '{:016x}'.format(satoshi_amount) + '{:016x}'.format(bitcoin_amount_desired) + \
            '{:02x}'.format(blocks) + '{:06x}'.format(0))
    dataHex_list.append('{:02x}'.format(0) + '{:02x}'.format(dataSequenceNum) + \
            '{:06x}'.format(min_buyer_fee))

    # create the BIP11 magic
    valid_dataHex_obfuscated_list=[]
    change_address_compressed_pub=get_compressed_pubkey_format(get_pubkey(changeAddress))
    obfus_str_list=get_obfus_str_list(seller,2)
    list_length=len(dataHex_list)
    for i in range(list_length):
        padded_dataHex=dataHex_list[i][2:]+''.zfill(len(change_address_compressed_pub)-len(dataHex_list[i]))[2:]
        dataHex_obfuscated=get_string_xor(padded_dataHex,obfus_str_list[i][:62]).zfill(62)
        random_byte=hex(random.randrange(0,255)).strip('0x').zfill(2)
        hacked_dataHex_obfuscated='02'+dataHex_obfuscated+random_byte
        info('plain dataHex:  --'+padded_dataHex+'--')
        info('obfus dataHex:  '+hacked_dataHex_obfuscated)
        valid_dataHex_obfuscated=get_nearby_valid_pubkey(hacked_dataHex_obfuscated)
        info('valid dataHex: '+valid_dataHex_obfuscated)
        valid_dataHex_obfuscated_list.append(valid_dataHex_obfuscated)
    script_str='1 [ '+change_address_pub+' ] [ '+valid_dataHex_obfuscated_list[0]+' ] [ '+valid_dataHex_obfuscated_list[1]+' ] 3 checkmultisig'
    info('change address is '+changeAddress)
    info('from_address is '+seller)
    info('total inputs value is '+str(inputs_total_value))
    info('fee is '+str(fee))
    info('dust limit is '+str(dust_limit))
    info('BIP11 script is '+script_str)
    dataScript=rawscript(script_str)

    inputs_outputs+=' -o '+exodus_address+':'+str(dust_limit) + \
                    ' -o '+dataScript+':'+str(2*dust_limit)
    if change_value >= dust_limit:
        inputs_outputs+=' -o '+changeAddress+':'+str(change_value)
    else:
        # under dust limit leave all remaining as fees
        pass

    tx=mktx(inputs_outputs)
    info('inputs_outputs are '+inputs_outputs)
    info('parsed tx is '+str(get_json_tx(tx)))

    hash160=bc_address_to_hash_160(seller).encode('hex_codec')
    prevout_script='OP_DUP OP_HASH160 ' + hash160 + ' OP_EQUALVERIFY OP_CHECKSIG'

    # tx, inputs
    return_dict={'transaction':tx, 'sourceScript':prevout_script}
    return return_dict


def sell_handler(environ, start_response):
    return general_handler(environ, start_response, sell_form_response)

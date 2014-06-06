import urlparse
import os, sys, re
from flask import Flask, request, jsonify, abort, json, make_response
from msc_apps import *

tools_dir = os.environ.get('TOOLSDIR')
lib_path = os.path.abspath(tools_dir)
sys.path.append(lib_path)
data_dir_root = os.environ.get('DATADIR')

app = Flask(__name__)
app.debug = True

@app.route('/50', methods=['POST'])
def generate_assets():
    expected_fields=['property_type', 'previous_property_id', 'property_category', 'property_subcategory', 'property_name', 'property_url', 'property_data', 'number_properties']
    # if marker is True, send dust to marker (for payments of sells)
    for field in expected_fields:
        if not request.form.has_key(field):
            #info('No field '+field+' in request form '+str(request.form))
            abort(403)
        if len(request.form[field]) != 1:
            #info('Multiple values for field '+field)
            abort(403)
      
    property_type=request.form['property_type']
    previous_property_id=request.form['previous_property_id']
    property_category=request.form['property_category']
    if property_category[-1] != '\0':
        property_category+='\0'
    property_subcategory=request.form['property_subcategory']
    if property_subcategory[-1] != '\0':
        property_subcategory+='\0'
    property_name=request.form['property_name']
    if property_name[-1] != '\0':
        property_name+='\0'    
    property_url=request.form['property_url']
    if property_url[-1] != '\0':
        property_url+='\0'
    property_data=request.form['property_data']
    if property_data[-1] != '\0':
        property_data+='\0'
    number_properties=request.form['number_properties']
            
    try:
        tx_to_sign_dict=prepare_tx_50_for_signing(transaction_version, transaction_type, ecosystem, property_type, previous_property_id, property_category, property_subcategory, property_name, property_url, property_data, number_properties)
        return jsonify(tx_to_sign_dict)
    except Exception as e:
        abort(502)


# simple send and bitcoin send (with or without marker)
def prepare_tx_50_for_signing(transaction_version, transaction_type, ecosystem, property_type, previous_property_id, property_category, property_subcategory, property_name, property_url, property_data, number_properties):

    #calculate bytes
    tx_ver_bytes = hex(transaction_version)[2:].rjust(4,"0") # 2 bytes
    tx_type_bytes = hex(transaction_type)[2:].rjust(4,"0")   # 2 bytes
    eco_bytes = hex(ecosystem)[2:].rjust(2,"0")              # 1 byte
    prop_type_bytes = hex(property_type)[2:].rjust(4,"0")    # 2 bytes
    prev_prop_id_bytes = hex(previous_property_id)[2:].rjust(8,"0")  # 4 bytes
    num_prop_bytes = hex(number_properties)[2:].rjust(16,"0")        # 8 bytes
    prop_cat_bytes = ''                                      # var bytes
    prop_subcat_bytes = ''                                   # var bytes
    prop_name_bytes = ''                                     # var bytes
    prop_url_bytes = ''                                      # var bytes
    prop_data_bytes = ''                                     # var bytes
    
    for let in property_category:
        prop_cat_bytes = prop_cat_bytes + hex(ord(let))[2:]
    prop_cat_bytes = prop_cat_bytes + '00'
    
    for let in property_subcategory:
        prop_subcat_bytes = prop_subcat_bytes + hex(ord(let))[2:]
    prop_subcat_bytes = prop_subcat_bytes + '00'
    
    for let in property_name:
        prop_name_bytes = prop_name_bytes + hex(ord(let))[2:]
    prop_name_bytes = prop_name_bytes + '00'
    
    for let in property_url:
        prop_url_bytes = prop_url_bytes + hex(ord(let))[2:]
    prop_url_bytes = prop_url_bytes + '00'
    
    for let in property_data:
        prop_data_bytes = prop_data_bytes + hex(ord(let))[2:]
    prop_data_bytes = prop_data_bytes + '00'
    
    total_bytes = (len(tx_ver_bytes) + 
                   len(tx_type_bytes) + 
                   len(eco_bytes) + 
                   len(prop_type_bytes) + 
                   len(prev_prop_id_bytes) + 
                   len(num_prop_bytes) + 
                   len(prop_cat_bytes) + 
                   len(prop_subcat_bytes) + 
                   len(prop_name_bytes) + 
                   len(prop_url_bytes) + 
                   len(prop_data_bytes))/2
    
    byte_stream = tx_ver_bytes + tx_type_bytes + eco_bytes + prop_type_bytes + prev_prop_id_bytes + prop_cat_bytes + prop_subcat_bytes + prop_name_bytes + prop_url_bytes + prop_data_bytes + num_prop_bytes
    
    #DEBUG print [tx_ver_bytes,tx_type_bytes,eco_bytes,prop_type_bytes,prev_prop_id_bytes,num_prop_bytes,prop_cat_bytes,prop_subcat_bytes,prop_name_bytes,prop_url_bytes,prop_data_bytes]
    
    #DEBUG print [len(tx_ver_bytes)/2,len(tx_type_bytes)/2,len(eco_bytes)/2,len(prop_type_bytes)/2,len(prev_prop_id_bytes)/2,len(num_prop_bytes)/2,len(prop_cat_bytes)/2,len(prop_subcat_bytes)/2,len(prop_name_bytes)/2,len(prop_url_bytes)/2,len(prop_data_bytes)/2]
                                                                                                                                 
    #DEBUG print [byte_stream, total_bytes]
    
    import math
    total_packets = int(math.ceil(float(total_bytes)/30)) #get # of packets
    
    total_outs = int(math.ceil(float(total_packets)/2)) #get # of outs
    
    #construct packets
    packets = []
    index = 0
    for i in range(total_packets):
        # 2 multisig data addrs per out, 60 bytes per, 2 characters per byte so 60 characters per pass
        parsed_data = byte_stream[index:index+60].ljust(60,"0")
        cleartext_packet =  (hex(i+1)[2:].rjust(2,"0") + parsed_data.ljust(60,"0"))
    
        index = index+60
        packets.append(cleartext_packet)
        #DEBUG print ['pax',cleartext_packet, parsed_data, total_packets, i]
    
    
    from_address = listOptions['transaction_from']
    obfuscation_packets = [hashlib.sha256(from_address).hexdigest().upper()]  #add first sha of sender to packet list
    for i in range(total_packets-1): #do rest for seqnums
        obfuscation_packets.append(hashlib.sha256(obfuscation_packets[i]).hexdigest().upper())
    
    #DEBUG print [packets,obfuscation_packets, len(obfuscation_packets[0]), len(obfuscation_packets[1]), len(packets[0])]
    
    #obfuscate and prepare multisig outs
    pair_packets = []
    for i in range(total_packets):
        obfuscation_packet = obfuscation_packets[i]
        pair_packets.append((packets[i], obfuscation_packet[:-2]))
    
    #encode the plaintext packets
    obfuscated_packets = []
    for pair in pair_packets:
        plaintext = pair[0].upper()
        shaaddress = pair[1] 
        #DEBUG print ['packets', plaintext, shaaddress, len(plaintext), len(shaaddress)]
        datapacket = ''
        for i in range(len(plaintext)):
            if plaintext[i] == '0':
                datapacket = datapacket + shaaddress[i]
            else:
                bin_plain = int('0x' + plaintext[i], 16)
                bin_sha = int('0x' + shaaddress[i], 16)
                #DEBUG print ['texts, plain & addr', plaintext[i], shaaddress[i],'bins, plain & addr', bin_plain, bin_sha ]
                xored = hex(bin_plain ^ bin_sha)[2:].upper()
                datapacket = datapacket + xored
        obfuscated_packets.append(( datapacket, shaaddress))
    
    #### Test that the obfuscated packets produce the same output as the plaintext packet inputs ####
    
    #decode the obfuscated packet
    plaintext_packets = []
    for pair in obfuscated_packets:
        obpacket = pair[0].upper()
        shaaddress = pair[1]
        #DEBUG print [obpacket, len(obpacket), shaaddress, len(shaaddress)]
        datapacket = ''
        for i in range(len(obpacket)):
            if obpacket[i] == shaaddress[i]:
                datapacket = datapacket + '0'
            else:
                bin_ob = int('0x' + obpacket[i], 16)
                bin_sha = int('0x' + shaaddress[i], 16)
                xored = hex(bin_ob ^ bin_sha)[2:].upper()
                datapacket = datapacket + xored
        plaintext_packets.append(datapacket)
    
    #check the packet is formed correctly by comparing it to the input
    final_packets = []
    for i in range(len(plaintext_packets)):
        orig = packets[i]
        if orig.upper() != plaintext_packets[i]:
            print ['packet did not come out right', orig, plaintext_packets[i] ]
        else:
            final_packets.append(obfuscated_packets[i][0])
    
    #DEBUG print plaintext_packets, obfuscation_packets,final_packets
    
    #add key identifier and ecdsa byte to new mastercoin data key
    for i in range(len(final_packets)):
        obfuscated = '02' + final_packets[i] + "00" 
        #DEBUG print [obfuscated, len(obfuscated)]
        invalid = True
        while invalid:
            obfuscated_randbyte = obfuscated[:-2] + hex(random.randint(0,255))[2:].rjust(2,"0").upper()
            #set the last byte to something random in case we generated an invalid pubkey
            potential_data_address = pybitcointools.pubkey_to_address(obfuscated_randbyte)
            #TODO: Refactor the use of bitcoind conn
            if bool(conn.validateaddress(potential_data_address).isvalid):
                final_packets[i] = obfuscated_randbyte
                invalid = False
        #make sure the public key is valid using pybitcointools, if not, regenerate 
        #the last byte of the key and try again
    
    #DEBUG print final_packets
    
    #### Build transaction
    
    #calculate fees
    fee_total = Decimal(0.0001) + Decimal(0.000055*total_packets+0.000055*total_outs) + Decimal(0.000055)
    #TODO: largest_spendable_input also comes from bitcoind
    change = largest_spendable_input['amount'] - fee_total
    # calculate change : 
    # (total input amount) - (broadcast fee)
    
    if (Decimal(change) < Decimal(0) or fee_total > largest_spendable_input['amount']) and not force:
        print json.dumps({ "status": "NOT OK", "error": "Not enough funds, you need " + str(fee_total) , "fix": "Set \'force\' flag to proceed without balance checks" })
        exit()
    
    #retrieve raw transaction to spend it
    #TODO: get the raw transacition without bitcoind conn
    prev_tx = conn.getrawtransaction(largest_spendable_input['txid'])
    
    validnextinputs = []                      #get valid redeemable inputs
    for output in prev_tx.vout:
        if output['scriptPubKey']['reqSigs'] == 1 and output['scriptPubKey']['type'] != 'multisig':
            for address in output['scriptPubKey']['addresses']:
                #TODO: transaction_from is the address that is creating the transaction, Maybe we should send that from the client?
                if address == listOptions['transaction_from']:
                    validnextinputs.append({ "txid": prev_tx.txid, "vout": output['n']})
    
    validnextoutputs = { "1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P": 0.000055 }
    
    if change > Decimal(0.000055): # send anything above dust to yourself
        validnextoutputs[ listOptions['transaction_from'] ] = float(change) 
    #TODO: remove bitcoind conn
    unsigned_raw_tx = conn.createrawtransaction(validnextinputs, validnextoutputs)
    
    json_tx =  conn.decoderawtransaction(unsigned_raw_tx)
    
    #append  data structure
    ordered_packets = []
    for i in range(total_outs):
        ordered_packets.append([])
    
    #append actual packet
    index = 0
    for i in range(total_outs):
        while len(ordered_packets[i]) < 2 and index != len(final_packets):
            ordered_packets[i].append(final_packets[index])
            index = index + 1
    #DEBUG print ordered_packets
    
    for i in range(total_outs):
        hex_string = "5141" + pubkey
        asm_string = "1 " + pubkey
        addresses = [ pybitcointools.pubkey_to_address(pubkey)]
        n_count = len(validnextoutputs)+i
        total_sig_count = 1
        #DEBUG print [i,'added string', ordered_packets[i]]
        for packet in ordered_packets[i]:
            hex_string = hex_string + "21" + packet.lower() 
            asm_string = asm_string + " " + packet.lower()
            addresses.append(pybitcointools.pubkey_to_address(packet))
            total_sig_count = total_sig_count + 1
        hex_string = hex_string + "5" + str(total_sig_count) + "ae"
        asm_string = asm_string + " " + str(total_sig_count) + " " + "OP_CHECKMULTISIG"
        #DEBUG print [hex_string, asm_string, addresses,total_sig_count]
        #add multisig output to json object
        json_tx['vout'].append(
            { 
                "scriptPubKey": 
                { 
                    "hex": hex_string, 
                    "asm": asm_string, 
                    "reqSigs": 1, 
                    "type": "multisig", 
                    "addresses": addresses 
                }, 
                "value": 0.000055*len(addresses), 
                "n": n_count
            })
    
    #print json_tx
    
    #construct byte arrays for transaction 
    #assert to verify byte lengths are OK
    version = ['01', '00', '00', '00' ]
    assert len(version) == 4
    
    num_inputs = [str(len(json_tx['vin'])).rjust(2,"0")]
    assert len(num_inputs) == 1
    
    num_outputs = [str(len(json_tx['vout'])).rjust(2,"0")]
    assert len(num_outputs) == 1
    
    sequence = ['FF', 'FF', 'FF', 'FF']
    assert len(sequence) == 4
    
    blocklocktime = ['00', '00', '00', '00']
    assert len(blocklocktime) == 4
    
    #prepare inputs data for byte packing
    inputsdata = []
    for _input in json_tx['vin']:
        prior_input_txhash = _input['txid'].upper()  
        prior_input_index = str(_input['vout']).rjust(2,"0").ljust(8,"0")
        input_raw_signature = _input['scriptSig']['hex']
        
        prior_txhash_bytes =  [prior_input_txhash[ start: start + 2 ] for start in range(0, len(prior_input_txhash), 2)][::-1]
        assert len(prior_txhash_bytes) == 32
    
        prior_txindex_bytes = [prior_input_index[ start: start + 2 ] for start in range(0, len(prior_input_index), 2)]
        assert len(prior_txindex_bytes) == 4
    
        len_scriptsig = ['%02x' % len(''.join([]).decode('hex').lower())] 
        assert len(len_scriptsig) == 1
        
        inputsdata.append([prior_txhash_bytes, prior_txindex_bytes, len_scriptsig])
    
    #prepare outputs for byte packing
    output_hex = []
    for output in json_tx['vout']:
        value_hex = hex(int(float(output['value'])*1e8))[2:]
        value_hex = value_hex.rjust(16,"0")
        value_bytes =  [value_hex[ start: start + 2 ].upper() for start in range(0, len(value_hex), 2)][::-1]
        assert len(value_bytes) == 8
        
       # print output
        scriptpubkey_hex = output['scriptPubKey']['hex']
        scriptpubkey_bytes = [scriptpubkey_hex[start:start + 2].upper() for start in range(0, len(scriptpubkey_hex), 2)]
        len_scriptpubkey = ['%02x' % len(''.join(scriptpubkey_bytes).decode('hex').lower())]
        #assert len(scriptpubkey_bytes) == 25 or len(scriptpubkey_bytes) == 71
    
        output_hex.append([value_bytes, len_scriptpubkey, scriptpubkey_bytes] )
    
    #join parts into final byte array
    hex_transaction = version + num_inputs
    
    for _input in inputsdata:
        hex_transaction += (_input[0] + _input[1] + _input[2] + sequence)
    
    hex_transaction += num_outputs
    
    for output in output_hex:
        hex_transaction = hex_transaction + (output[0] + output[1] + output[2]) 
    
    hex_transaction = hex_transaction + blocklocktime
    #TODO: remove bitcoind conn
    #verify that transaction is valid
    assert type(conn.decoderawtransaction(''.join(hex_transaction).lower())) == type({})

    # tx, inputs
    return_dict={'transaction':hex_transaction}
    return return_dict

@app.route('/51', methods=['POST'])
def crowdsale_assets():
    pass  #placeholder for tx51  
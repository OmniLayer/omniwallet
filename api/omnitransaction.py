import urlparse
import os, sys, re, random, pybitcointools, bitcoinrpc, math
from decimal import Decimal
from msc_apps import *
from blockchain_utils import *
import config

class OmniTransaction:
    confirm_target=6
    HEXSPACE_SECOND='21'
    mainnet_exodus_address='1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P'
    testnet_exodus_address='mpexoDuSkGGqvqrkrjiFng38QPkJQVFyqv'

    def __init__(self,tx_type,form):
        self.conn = getRPCconn()
        self.testnet = False
        self.magicbyte = 0
        self.exodus_address=self.mainnet_exodus_address

        if 'testnet' in form and ( form['testnet'] in ['true', 'True'] ):
            self.testnet =True
            self.magicbyte = 111
            self.exodus_address=self.testnet_exodus_address

        try:
          if config.D_PUBKEY and ( 'donate' in form ) and ( form['donate'] in ['true', 'True'] ):
            print "We're Donating to pubkey for: "+pybitcointools.pubkey_to_address(config.D_PUBKEY)
            self.pubkey = config.D_PUBKEY
          else:
            print "not donating"
            self.pubkey = form['pubkey']
        except NameError, e:
          print e
          self.pubkey = form['pubkey']
        #self.fee = estimateFee(self.confirm_target)['result']
        #make sure fee is correct length
        self.fee = int(float(form['fee'])*float(1e8))/1e8
        self.rawdata = form.copy()
        self.tx_type = tx_type

    def get_unsigned(self):
      try:

        if 'memo' not in self.rawdata:
          self.rawdata['memo']=''

        # get payload
        payload = self.__generate_payload()
        if 'error' in payload:
          raise Exception(payload['msg'])

        #initialize values
        rawtx = None
        fee_total = Decimal(self.fee)

        if 'transaction_to' in self.rawdata:
            # Add reference for reciever to figure out potential tx cost
            rawtx = createrawtx_reference(self.rawdata['transaction_to'], rawtx)['result']

            # Decode transaction to get total needed amount
            decodedtx = decoderawtransaction(rawtx)['result']

            # Sum up the outputs
            for output in decodedtx['vout']:
                fee_total += Decimal(output['value'])

        # Determine size of payload for multisig if necessary
        if len(payload) > 152:  #80bytes - 4 bytes for omni marker
            rawtx = None
            rawtx = createrawtx_multisig(payload, self.rawdata['transaction_from'], self.pubkey, rawtx)['result']
            decodedtx = decoderawtransaction(rawtx)['result']

            # Sum up the outputs
            for output in decodedtx['vout']:
              fee_total += Decimal(output['value'])

        #get total fee in satoshis
        fee_total_satoshi = int( round( fee_total * Decimal(1e8) ) )

        # Get utxo to generate inputs
        print "Calling bc_getutxo with ", self.rawdata['transaction_from'], fee_total_satoshi
        dirty_txes = bc_getutxo( self.rawdata['transaction_from'], fee_total_satoshi )
        print "received", dirty_txes

        if (dirty_txes['error'][:3]=='Con'):
            return { "status": "NOT OK", "error": "Couldn't get list of unspent tx's. Response Code: " + str(dirty_txes['code'])  }

        if (dirty_txes['error'][:3]=='Low'):
            return { "status": "NOT OK", "error": "Not enough funds, try again. Needed: " + str(fee_total) + " but Have: " + str(dirty_txes['avail'] / Decimal(1e8))  }

        total_amount = dirty_txes['avail']
        unspent_tx = dirty_txes['utxos']

        change = total_amount - fee_total_satoshi

        #DEBUG 
        #print [ "Debugging...", dirty_txes,"miner fee sats: ", self.fee, "change: ",change,"total_amt: ", total_amount,"fee tot sat: ", fee_total_satoshi,"utxo ",  unspent_tx,"to ", self.rawdata['transaction_to'] ]

        prevout_script={}

        #reset tx to create it proper from scratch
        rawtx=None
        validnextinputs = []   #get valid redeemable inputs
        for unspent in unspent_tx:
            #retrieve raw transaction to spend it
            prev_tx = getrawtransaction(unspent[0])['result']

            output = prev_tx['vout'][int(unspent[1])]
            if 'reqSigs' in output['scriptPubKey'] and output['scriptPubKey']['reqSigs'] == 1:
                for address in output['scriptPubKey']['addresses']:
                   if address == self.rawdata['transaction_from'] and int(output['n']) == int(unspent[1]):
                        validnextinputs.append({ "txid": prev_tx['txid'], "vout": output['n'], "scriptPubKey" : output['scriptPubKey']['hex'], "value" : output['value']})
                        prevout_script[str(prev_tx['txid'])+":"+str(output['n'])] = output['scriptPubKey']['asm']
                        break
        # Add the inputs
        for input in validnextinputs:
            rawtx = createrawtx_input(input['txid'],input['vout'],rawtx)['result']


        if 'transaction_to' in self.rawdata:
            # Add reference for reciever
            rawtx = createrawtx_reference(self.rawdata['transaction_to'], rawtx)['result']

        # Add the payload    
        if len(payload) <= 152:  #80bytes - 4 bytes for omni marker
            rawtx = createrawtx_opreturn(payload, rawtx)['result']
        else:
            rawtx = createrawtx_multisig(payload, self.rawdata['transaction_from'], self.pubkey, rawtx)['result']

        # Add the change
        rawtx = createrawtx_change(rawtx, validnextinputs, self.rawdata['transaction_from'], float(self.fee))['result']

        return { 'status':200, 'unsignedhex': rawtx , 'sourceScript': prevout_script }
      except Exception as e:
        return { 'status':503, 'error': e.message }

    def __generate_payload(self):
      try:
        if self.tx_type == 0:
            return getsimplesendPayload(self.rawdata['currency_identifier'], self.rawdata['amount_to_transfer'])['result']
        if self.tx_type == 20:
            return getdexsellPayload(self.rawdata['currency_identifier'], self.rawdata['amount_for_sale'], self.rawdata['amount_desired'], self.rawdata['blocks'], self.rawdata['min_buyer_fee'], self.rawdata['action'])['result']
        if self.tx_type == 22:
            txhash = self.rawdata['tx_hash']
            txhash = re.sub(r'\W+', '', txhash)
            ROWS = dbSelect("select ao.*,t.txhash,t.protocol,t.txdbserialnum,t.txtype,t.txversion,t.ecosystem,t.txrecvtime,t.txstate,t.txerrorcode,"
                     "t.txblocknumber,t.txseqinblock,txj.txdbserialnum,txj.protocol,txj.txdata "
                     "from activeoffers ao, transactions t, txjson txj where t.txhash=%s "
                     "and ao.createtxdbserialnum=t.txdbserialnum and ao.createtxdbserialnum=txj.txdbserialnum", [txhash] )
 
            # sanity check
            if len(ROWS) == 0:
               error('no sell offer found for tx '+self.rawdata['tx_hash'])
            row = ROWS[0]
 
            try:
                rawdata = json.loads(row[-1])
            except TypeError:
                rawdata = row[-1]
 
            self.rawdata['transaction_to']=rawdata['sendingaddress']
            formatted_fee_required=str(row[3])
 
            # fee is max between min_btc_fee and required_fee
            required_fee=int( formatted_fee_required )
            satoshi_min_fee=int( Decimal(self.fee) * Decimal(1e8) )
            self.fee= '%.8f' % ( Decimal(max(satoshi_min_fee,required_fee)) / Decimal(1e8) )
            return getdexacceptPayload(rawdata['propertyid'], self.rawdata['amount'])['result']
        if self.tx_type == 50:
            return getissuancefixedPayload(self.rawdata['ecosystem'],self.rawdata['property_type'],self.rawdata['previous_property_id'],self.rawdata['property_category'],self.rawdata['property_subcategory'],self.rawdata['property_name'],self.rawdata['property_url'],self.rawdata['property_data'],self.rawdata['number_properties'])['result']
        if self.tx_type == 51:
            return getissuancecrowdsalePayload(self.rawdata['ecosystem'],self.rawdata['property_type'],self.rawdata['previous_property_id'],self.rawdata['property_category'],self.rawdata['property_subcategory'],self.rawdata['property_name'],self.rawdata['property_url'],self.rawdata['property_data'],self.rawdata['currency_identifier_desired'],self.rawdata['number_properties'], self.rawdata['deadline'], self.rawdata['earlybird_bonus'], self.rawdata['percentage_for_issuer'])['result']
        if self.tx_type == 54:
            return getissuancemanagedPayload(self.rawdata['ecosystem'],self.rawdata['property_type'],self.rawdata['previous_property_id'],self.rawdata['property_category'],self.rawdata['property_subcategory'],self.rawdata['property_name'],self.rawdata['property_url'],self.rawdata['property_data'])['result']
        if self.tx_type == 55:
            return getgrantPayload(self.rawdata['currency_identifier'], self.rawdata['amount'], self.rawdata['memo'])['result']
        if self.tx_type == 56:
            return getrevokePayload(self.rawdata['currency_identifier'], self.rawdata['amount'], self.rawdata['memo'])['result']
        if self.tx_type == 25:
            return gettradePayload(self.rawdata['propertyidforsale'], self.rawdata['amountforsale'], self.rawdata['propertiddesired'], self.rawdata['amountdesired'])['result']
        if self.tx_type == 26:
            return getcanceltradesbypricePayload(self.rawdata['propertyidforsale'], self.rawdata['amountforsale'], self.rawdata['propertiddesired'], self.rawdata['amountdesired'])['result']
        if self.tx_type == 27:
            return getcanceltradesbypairPayload(self.rawdata['propertyidforsale'], self.rawdata['propertiddesired'])['result']
        if self.tx_type == 28:
            return getcancelalltradesPayload(self.rawdata['ecosystem'])['result']
        if self.tx_type == 70:
            return getchangeissuerPayload(self.rawdata['currency_identifier'])['result']
      except Exception as e:
        if 'call' in e.message:
          msg=e.message.split("call: ")[1]
          ret=re.findall('{.+',str(msg))
          try:
            msg=json.loads(ret[0])
          except TypeError:
            msg=ret[0]
          except ValueError:
            #reverse the single/double quotes and strip leading u in output to make it json compatible
            msg=json.loads(ret[0].replace("'",'"').replace('u"','"'))

          return { 'error': True, 'msg': msg['message'] }
        else:
          return { 'error': True, 'msg': e.message }

import json
from msc_apps import *
from blockchain_utils import *

def get_balancedata(address):
    addr = re.sub(r'\W+', '', address) #check alphanumeric
    ROWS=dbSelect("""select
                       f1.propertyid, sp.propertytype, f1.balanceavailable, f1.pendingpos, f1.pendingneg
                     from
                       (select
                          COALESCE(s1.propertyid,s2.propertyid) as propertyid, COALESCE(s1.balanceavailable,0) as balanceavailable,
                          COALESCE(s2.pendingpos,0) as pendingpos,COALESCE(s2.pendingneg,0) as pendingneg
                        from
                          (select propertyid,balanceavailable
                           from addressbalances
                           where address=%s) s1
                        full join
                          (SELECT atx.propertyid,
                             sum(CASE WHEN atx.balanceavailablecreditdebit > 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingpos,
                             sum(CASE WHEN atx.balanceavailablecreditdebit < 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingneg
                           from
                             addressesintxs atx, transactions tx
                           where
                             atx.txdbserialnum=tx.txdbserialnum
                             and tx.txstate='pending'
                             and tx.txdbserialnum<-1
                             and atx.address=%s
                           group by
                             atx.propertyid) s2
                        on s1.propertyid=s2.propertyid) f1
                     inner join smartproperties sp
                     on f1.propertyid=sp.propertyid and (sp.protocol='Omni' or sp.protocol='Bitcoin')
                     order by f1.propertyid""",(addr,addr))

    balance_data = { 'balance': [] }
    ret = bc_getbalance(addr)
    out = ret['bal']
    err = ret['error']
    for balrow in ROWS:
        cID = str(int(balrow[0])) #currency id
        sym_t = ('BTC' if cID == '0' else ('OMNI' if cID == '1' else ('T-OMNI' if cID == '2' else 'SP' + cID) ) ) #symbol template
        #1 = new indivisible property, 2=new divisible property (per spec)
        divi = True if int(balrow[1]) == 2 else False
        res = { 'symbol' : sym_t, 'divisible' : divi, 'id' : cID }
        res['pendingpos'] = str(long(balrow[3]))
        res['pendingneg'] = str(long(balrow[4]))
        if cID == '0':
          #get btc balance from bc api's
          if err != None or out == '':
            #btc_balance[ 'value' ] = str(long(-555))
            btc_balance[ 'value' ] = str(long(0))
            btc_balance[ 'error' ] = True
          else:
            try:
              if balrow[4] < 0:
                #res['value'] = str(long( json.loads( out )[0][ 'paid' ]) + str(long(balrow[4]))
                #res['value'] = str(long( json.loads( out )['data']['balance']*1e8) + str(long(balrow[4]))
                res['value'] = str(long( out ) + long(balrow[4]))
              else:
                #res['value'] = str(long( json.loads( out )[0][ 'paid' ]))
                #res['value'] = str(long( json.loads( out )['data']['balance']*1e8))
                res['value'] = str(long( out ))
            except ValueError:
              #btc_balance[ 'value' ] = str(long(-555))
              btc_balance[ 'value' ] = str(long(0))
              btc_balance[ 'error' ] = True
        else:
          #get regular balance from db
          if balrow[4] < 0:
            #update the 'available' balance immediately when the sender sent something. prevent double spend
            res['value'] = str(long(balrow[2]+balrow[4]))
          else:
            res['value'] = str(long(balrow[2]))

        #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
        balance_data['balance'].append(res)

    #check if we got BTC data from DB, if not trigger manually add
    addbtc=True
    for x in balance_data['balance']:
      if "BTC" in x['symbol']:
        addbtc=False

    if addbtc:
      btc_balance = { 'symbol': 'BTC', 'divisible': True, 'id' : 0, 'error' : False }
      if err != None or out == '':
        #btc_balance[ 'value' ] = str(long(-555))
        btc_balance[ 'value' ] = str(long(0))
        btc_balance[ 'error' ] = True
      else:
        try:
          #btc_balance[ 'value' ] = str(long( json.loads( out )[0][ 'paid' ]))
          #btc_balance[ 'value' ] = str(long( json.loads( out )['data']['balance']*1e8 ))
          btc_balance[ 'value' ] = str(long( out ))
        except ValueError:
          #btc_balance[ 'value' ] = str(long(-555))
          btc_balance[ 'value' ] = str(long(0))
          btc_balance[ 'error' ] = True
      btc_balance['pendingpos'] = str(long(0))
      btc_balance['pendingneg'] = str(long(0))
      balance_data['balance'].append(btc_balance)

    return balance_data



def get_bulkbalancedata(addresses):
    btclist=bc_getbulkbalance(addresses)

    retval = {}

    for address in addresses:
      addr = re.sub(r'\W+', '', address) #check alphanumeric
      ROWS=dbSelect("""select
                       f1.propertyid, sp.propertytype, f1.balanceavailable, f1.pendingpos, f1.pendingneg
                     from
                       (select
                          COALESCE(s1.propertyid,s2.propertyid) as propertyid, COALESCE(s1.balanceavailable,0) as balanceavailable,
                          COALESCE(s2.pendingpos,0) as pendingpos,COALESCE(s2.pendingneg,0) as pendingneg
                        from
                          (select propertyid,balanceavailable
                           from addressbalances
                           where address=%s) s1
                        full join
                          (SELECT atx.propertyid,
                             sum(CASE WHEN atx.balanceavailablecreditdebit > 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingpos,
                             sum(CASE WHEN atx.balanceavailablecreditdebit < 0 THEN atx.balanceavailablecreditdebit ELSE 0 END) AS pendingneg
                           from
                             addressesintxs atx, transactions tx
                           where
                             atx.txdbserialnum=tx.txdbserialnum
                             and tx.txstate='pending'
                             and tx.txdbserialnum<-1
                             and atx.address=%s
                           group by
                             atx.propertyid) s2
                        on s1.propertyid=s2.propertyid) f1
                     inner join smartproperties sp
                     on f1.propertyid=sp.propertyid and (sp.protocol='Omni' or sp.protocol='Bitcoin')
                     order by f1.propertyid""",(addr,addr))

      balance_data = { 'balance': [] }
      try:
        if address in btclist:
          out = btclist[address]
          err = None
        else:
          out = ''
          err = "Missing"
      except TypeError:
        out = ''
        err = "Missing"

      for balrow in ROWS:
        cID = str(int(balrow[0])) #currency id
        sym_t = ('BTC' if cID == '0' else ('OMNI' if cID == '1' else ('T-OMNI' if cID == '2' else 'SP' + cID) ) ) #symbol template
        #1 = new indivisible property, 2=new divisible property (per spec)
        divi = True if int(balrow[1]) == 2 else False
        res = { 'symbol' : sym_t, 'divisible' : divi, 'id' : cID }
        res['pendingpos'] = str(long(balrow[3]))
        res['pendingneg'] = str(long(balrow[4]))
        if cID == '0':
          #get btc balance from bc api's
          if err != None or out == '':
            #btc_balance[ 'value' ] = str(long(-555))
            btc_balance[ 'value' ] = str(long(0))
            btc_balance[ 'error' ] = True
          else:
            try:
              if balrow[4] < 0:
                #res['value'] = str(long( json.loads( out )[0][ 'paid' ]) + str(long(balrow[4]))
                res['value'] = str(long( out ) + long(balrow[4]))
              else:
                #res['value'] = str(long( json.loads( out )[0][ 'paid' ]))
                res['value'] = str(long( out ))
            except ValueError:
              #btc_balance[ 'value' ] = str(long(-555))
              btc_balance[ 'value' ] = str(long(0))
              btc_balance[ 'error' ] = True
        else:
          #get regular balance from db
          if balrow[4] < 0:
            #update the 'available' balance immediately when the sender sent something. prevent double spend
            res['value'] = str(long(balrow[2]+balrow[4]))
          else:
            res['value'] = str(long(balrow[2]))

        #res['reserved_balance'] = ('%.8f' % float(balrow[5])).rstrip('0').rstrip('.')
        balance_data['balance'].append(res)

      #check if we got BTC data from DB, if not trigger manually add
      addbtc=True
      for x in balance_data['balance']:
        if "BTC" in x['symbol']:
          addbtc=False

      if addbtc:
        btc_balance = { 'symbol': 'BTC', 'divisible': True, 'id' : 0 ,'error' : False}
        if err != None or out == '':
          #btc_balance[ 'value' ] = str(long(-555))
          btc_balance[ 'value' ] = str(long(0))
          btc_balance[ 'error' ] = True
        else:
          try:
            #btc_balance[ 'value' ] = str(long( json.loads( out )[0][ 'paid' ]))
            btc_balance[ 'value' ] = str(long(  out ))
          except ValueError:
            #btc_balance[ 'value' ] = str(long(-555))
            btc_balance[ 'value' ] = str(long(0))
            btc_balance[ 'error' ] = True
        btc_balance['pendingpos'] = str(long(0))
        btc_balance['pendingneg'] = str(long(0))
        balance_data['balance'].append(btc_balance)

      retval[address]=balance_data
    return retval

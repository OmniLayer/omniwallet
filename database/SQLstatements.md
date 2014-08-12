
This file contains the proposed queries and actions for the Omniwallet database.
 
## Queries	
1. Get the encrypted Wallet for a Wallet ID

```
select
	WalletBlob
from
	Wallets
where
	WalletID = '\x<walletid>'
```

1. Get Addresses and Balances & Values in a Wallet

```
select
	ab.Address
	, ab.PropertyID
	, ab.BalanceAvailable
	, (ab.BalanceAvailable * Rate1For2) ValueAvailable
	, ab.BalanceResForOffer
	, (ab.BalanceResForOffer * Rate1For2) ValueResForOffer
	, ab.BalanceResForAccept
	, (ab.BalanceResForAccept * Rate1For2) ValueResForAccept
from
	AddressBalances ab
	, AddressesInWallets aiw
	, ExchangeRates exr
where
	aiw.WalletID = '\x<walletid>'
	and aiw.Address = ab.Address
	and ab.BaseProtocol = 'Bitcoin'
	and exr.PropertyID2 = ab.PropertyID
	and exr.BaseProtocol = ab.BaseProtocol
	and exr.PropertyID1 = <USD_ID>
	/*
	 for Production ecosystem add:
	 and ab.Ecosystem = 'Production'
	*/
order by
	PropertyID
```
1. Get All Balances & Values for an Address

```
select
	ab.PropertyID
	, ab.BalanceAvailable
	, (ab.BalanceAvailable * Rate1For2) ValueAvailable
	, ab.BalanceResForOffer
	, (ab.BalanceResForOffer * Rate1For2) ValueResForOffer
	, ab.BalanceResForAccept
	, (ab.BalanceResForAccept * Rate1For2) ValueResForAccept
from
	AddressBalances ab
	, ExchangeRates exr
where
	ab.Address = '<address>'
	and ab.BaseProtocol = 'Bitcoin'
	and exr.PropertyID2 = ab.PropertyID
	and exr.BaseProtocol = ab.BaseProtocol
	and exr.PropertyID1 = <USD_ID>
order by
	PropertyID
```

1. Get a Balance & Values for an Address & Currency

```
select
	ab.PropertyID
	, ab.BalanceAvailable
	, (ab.BalanceAvailable * Rate1For2) ValueAvailable
	, ab.BalanceResForOffer
	, (ab.BalanceResForOffer * Rate1For2) ValueResForOffer
	, ab.BalanceResForAccept
	, (ab.BalanceResForAccept * Rate1For2) ValueResForAccept
from
	AddressBalances ab
	, ExchangeRates exr
where
	ab.Address = '<address>'
	and ab.PropertyID = <propertyid>
	and ab.BaseProtocol = 'Bitcoin'
	and exr.PropertyID2 = ab.PropertyID
	and exr.BaseProtocol = ab.BaseProtocol
	and exr.PropertyID1 = <USD_ID>
```

1. Get Transactions for Addresses in a Wallet

```
select
	tx.*
from
	AddressesInWallets aiw
	, AddressesInTxs ait
	, Transactions tx
where
	aiw.WalletID = '\x<walletid>'
	and aiw.Address = ait.Address
	and ait.TxHash = tx.TxHash
	/*
	 for Production ecosystem add:
	 and tx.Ecosystem = 'Production'
	*/
order by
	TxSubmitTime	/* time submitted, maybe not yet confirmed or valid */
```

1. Get Transactions for an Address

```
select
	tx.*
from
	AddressesInTxs ait
	, Transactions tx
where
	and ait.Address = '<address>'
	and ait.TxHash = tx.TxHash
	/*
	 for Production ecosystem add:
	 and tx.Ecosystem = 'Production'
	*/
order by
	TxSubmitTime	/* time submitted, maybe not yet confirmed or valid */
```

1. Get Details for a Transaction

```
select
	tx.*
from
	Transactions tx
where
	tx.TxHash = '\x<txhash>'
```

1. Get exchange rates

```
select
	exr.*
from
	ExchangeRates exr
order by
	BaseProtocol1, PropertyID1
```
	
## Actions

1. Create a Wallet
1. Remove a Wallet
1. Login to a Wallet
1. Change Wallet profile info, e.g. password, username, email
1. Add an Address to a Wallet
1. Remove an Address from a Wallet
1. Create a Wallet Backup
1. Create a Transaction

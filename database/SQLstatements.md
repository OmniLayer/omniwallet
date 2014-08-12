
This file contains proposed SQL that implements queries and actions for the Omniwallet database.
 
## Queries	
### Get the encrypted Wallet for a Wallet ID
```
Select
	WalletBlob
from
	Wallets
where
	WalletID = '\x<walletid>'
```

### Get Addresses and Balances & Values in a Wallet
```
Select
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
### Get All Balances & Values for an Address
```
Select
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
### Get Balances & Values for an Address & Currency
```
Select
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
### Get Transactions for Addresses in a Wallet
```
Select
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
Select
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
### Get Details for a Transaction
```
Select
	tx.*
from
	Transactions tx
where
	tx.TxHash = '\x<txhash>'
```
### Get exchange rates
```
Select
	exr.*
from
	ExchangeRates exr
order by
	BaseProtocol1, PropertyID1
```
## Actions

### Create a Wallet

1. Add a record to Wallets 
2. Add a record to AddressBalances
3. Add a record to AddressesInWallets

### Mark a Wallet as inactive (logically removed)
```
Update
	Wallets
set
	WalletState = 'Inactive'
	, StateDate = CURRENT_TIMESTAMP
where
	WalletID = '\x<walletid>'
```
### Login to a Wallet

1. Update the lastlogin time
2. Get the encrypted wallet blob
3. Get the latest currency & balance info for all the addresses from MasterCore
 1. Foreach address, update AddressBalances if there are new transactions
4. Get latest transaction history for the addresses (now or on demand?)
 1. Update AddressesInTransactions & Transactions if there are new transactions
```
Update
	Wallets
set
	LastLogin = CURRENT_TIMESTAMP
where
	WalletID = '\x<walletid>'
	
Select
	WalletBlob
from
	Wallets
where
	WalletID = '\x<walletid>'
```
### Add an Address to a Wallet

1. Get the latest currency & balance info for  the address from MasterCore
 1. Insert/Update AddressBalances if there are new transactions
1. Get latest transaction history for the address (now or on demand?)
 1. Insert/Update AddressesInTransactions & Transactions if there are new transactions
1. Insert a record into AddressesInWallets
3. 

### Remove an Address from a Wallet

1. Remove the address' record from AddressesInWallets
```
Delete
	AddressesInWallets
where
	Address = '<address>'
	and BaseProtocol = 'Bitcoin'
```
### Create a Wallet Backup

1. 

### Create a Transaction

1.

### Change Wallet profile info, e.g. password, username, email
(Future)


This file contains proposed SQL that implements queries and actions for the Omniwallet database.
 
## Queries	
### Get the encrypted Wallet for a Wallet ID
```
Select
	WalletBlob
from
	Wallets
where
	WalletID = '<walletid>'
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
	aiw.WalletID = '<walletid>'
	and aiw.Address = ab.Address
	and (ab.Protocol = 'Bitcoin' or ab.Protocol = 'Mastercoin')
	and exr.PropertyID2 = ab.PropertyID
	and exr.Protocol = ab.Protocol
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
	and (ab.Protocol = 'Bitcoin' or ab.Protocol = 'Mastercoin')
	and exr.PropertyID2 = ab.PropertyID
	and exr.Protocol = ab.Protocol
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
	and (ab.Protocol = 'Bitcoin' or ab.Protocol = 'Mastercoin')
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
	aiw.WalletID = '<walletid>'
	and aiw.Address = ait.Address
	and ait.TxHash = tx.TxHash
	/*
	 for Production ecosystem add:
	 and ait.Protocol = 'Mastercoin'
	 and tx.Ecosystem = 'Production'
	*/
order by
	tx.TxSubmitTime	/* time submitted, maybe not yet confirmed or valid */
```
### Get Transactions record(s) for an Address
```
Select
	tx.*
from
	AddressesInTxs ait
	, Transactions tx
where
	and ait.Address = '<address>'
	and ait.TxDBSerialNum = tx.TxDBSerialNum
	/*
	 for Production ecosystem add:
	 and ait.Protocol = 'Mastercoin'
	 and tx.Ecosystem = 'Production'
	*/
order by
	tx.TxSubmitTime	/* time submitted, maybe not yet confirmed or valid */
```
### Get Transactions record(s) for a tx hash
```
Select
	tx.*
from
	Transactions tx
where
	tx.TxHash = '<txhash>'
```
### Get Transactions record(s) for a TxDBSerialNum
```
Select
	tx.*
from
	Transactions tx
where
	tx.TxDBSerialNum = <TxDBSerialNum>
```
### Get Transactions record(s) for an Address
```
Select
	tx.*
from
	AddressesInTxs ait
	, Transactions tx
where
	and ait.Address = '<address>'
	and ait.TxDBSerialNum = tx.TxDBSerialNum
	/*
	 for Production ecosystem add:
	 and ait.Protocol = 'Mastercoin'
	 and tx.Ecosystem = 'Production'
	*/
order by
	tx.TxSubmitTime	/* time submitted, maybe not yet confirmed or valid */
```
### Get AddressesInTxs record(s) for a tx hash
```
Select
	ait.*
from
	AddressesInTxs ait
	, Transactions tx
where
	tx.TxHash = '<txhash>'
	and ait.TxDBSerialNum = tx.TxDBSerialNum
```
### Get AddressesInTxs record(s) for a TxDBSerialNum
```
Select
	*
from
	AddressesInTxs
where
	TxDBSerialNum = <TxDBSerialNum>
order by
	PropertyID
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

```
/* Either all 3 steps succeed or none of them do */
Start Transaction

/* 
 * all the other columns have appropriate defaults or are nullable when a user creates a wallet & logs in
 */
Insert Wallets (
	WalletID
	, WalletBlob	/* the encrypted Blob contains the private key for the initial address
)
values
(
	<WalletID>
	, <WalletBlob>
)

/* 
 * all the other columns have appropriate defaults or are nullable when a user creates a wallet & logs in;
 * by default, there's a 0 bitcoin available balance for each address
 */
Insert AddressBalances
(
	Address
)
values
(
	<Address>
)

/* 
 * all the other columns have appropriate defaults or are nullable when a user creates a wallet & logs in;
 * by default, there's a 0 bitcoin available balance for each address
 */
Insert AddressesInWallets
(
	Address
)
values
(
	<Address>
)

Commit Transaction
```

### Mark a Wallet as inactive (logically removed)
```
Update
	Wallets
set
	WalletState = 'Inactive'
	, StateDate = CURRENT_TIMESTAMP
where
	WalletID = '<walletid>'
```
### Login to a Wallet

0. Make sure the wallet state is "Active"
1. Update the lastlogin time
2. Get the encrypted wallet blob
Are the following steps necessary or is this already done in the background?
4. Get the latest currency & balance info for all the addresses from MasterCore
 1. Foreach address, update AddressBalances if there are new transactions
5. Get latest transaction history for the addresses (now or on demand?)
 1. Update AddressesInTransactions & Transactions if there are new transactions

 
Update the lastlogin time if the wallet state is "Active"
```
Start Transaction

Update
	Wallets
set
	LastLogin = CURRENT_TIMESTAMP
	, SignedIn = TRUE
where
	WalletState = 'Active'
	and WalletID = '<walletid>'
```	
If no rows returned
then exit
```
Commit Transaction /* Rollback should be equivalent because no row was updated */
```

Get the encrypted wallet blob
```
Select
	WalletBlob
from
	Wallets
where
	and WalletID = '<walletid>'
```
Get the latest currency & balance info for all the addresses from MasterCore
 1. Foreach address, update AddressBalances if there are new transactions
```
```

### Add an Address to a Wallet

1. Get the latest currency & balance info for  the address from MasterCore
 1. Insert/Update AddressBalances if there are new transactions
1. Get latest transaction history for the address (now or on demand?)
 1. Insert/Update AddressesInTransactions & Transactions if there are new transactions
1. Insert a record into AddressesInWallets
3. 

### Remove an Address from a Wallet

1. First, update the encrypted wallet (after the address is removed from the blob by the front-end)
```
Start Transaction

Update		/* update the encrypted wallet (after the address is removed from the blob by the front-end) */
	Wallets
set
	WalletBlob = '<walletblob>'
where
	and WalletID = '<walletid>'
```	

2. Then, remove the address' record from AddressesInWallets
```
Delete			/* remove the address-wallet association, but leave the address balance & tx history */
	AddressesInWallets
where
	Address = '<address>'
	and (Protocol = 'Bitcoin' or Protocol = 'Mastercoin')
	
Commit Transaction
```
### Record a Wallet Backup

The front-end creates the wallet. The db just captures the time it was done
```
Update
	Wallets
set
	LastBackup = CURRENT_TIMESTAMP	/* LastBackup has whole-second precision */
	
Commit Transaction
```

### Create a Transaction

1.

### Change Wallet profile info, e.g. password, username, email
(Future)

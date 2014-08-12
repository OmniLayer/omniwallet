
this file contains the proposed queries and actions for the Omniwallet database
 
 Queries	
1. Get Wallet for a Wallet ID
 * ```
 select WalletBlob from Wallets where WalletID = '\x<walletid>'
 ```
1. Get Addresses in a Wallet
1. Get All Balances & Values for an Address
1. Get a Balance for an Address & Currency
1. Get Transactions for an Address in a Wallet
1. Get Details for a Transaction
1. Get exchange rates
	
Actions	
1. Create a Wallet
1. Remove a Wallet
1. Login to a Wallet
1. Change Wallet profile info, e.g. password, username, email
1. Add an Address to a Wallet
1. Remove an Address from a Wallet
1. Create a Wallet Backup
1. Create a Transaction

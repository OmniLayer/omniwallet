# Mastercoin Web Wallet Design

What is Mastercoin?

[from wiki.mastercoin.org]
Mastercoin is both a new type of currency (MSC) and a platform. It is a new protocol layer 
running on top of bitcoin like HTTP runs on top of TCP/IP. Its purpose is to build upon the 
core Bitcoin protocol and add new advanced features, with a focus on a straight-forward and 
easy to understand implementation which allows for analysis and its rapid development. 

Why do we need a web-wallet?
We anticipate most users will not want to understand the technical details of running a standalone wallet.
To counter user dissatisfaction and garner a strong following, Mastercoin will require an easy
to use wallet not requiring user installation. Web-wallets are the typical manifestation of this
requirement, but we recognize the concern for security is not typically heeded. The concern for
security is another motivation in this regard, and a section will be written regarding those 
concerns.

Who is this document for>
This specification has been written with developers and users of Mastercoin in mind. We anticipate 
changes to this document and eagerly accept outside contributions through Github pull requests. 

Risks 

Web wallet security
Traditionally, web wallets are designed with the security implication of handling user data. 
In our case, user data includes bitcoin private keys. Since this is a appealing target for
criminals, our aim in this project will be to minimize the risk of the user in using our 
service, by developing software to run without the handling of user private keys. This has been
attempted with success by the web wallet and blockchain query service blockchain.info. We are 
confident this level of security can and should be implemented by our software.

## High-level design overview

Our end goal is to provide Mastercoin users with a client-side encrypted web-wallet to store 
funds and make/view Class A/B transactions. To that end our plan is to leverage My-Wallet as a 
source of truth in building a browser client-side implementation of the Mastercoin web-wallet.
We would additionally like to include a Mastercoin block-explorer on the website, so users can 
view A/B transactions on the Masterchain with extensions for user-currency block-exploration.

## Stage 1 Features

- High level API implementing Mastercoin specification from querying transactions to creating new currencies
- [ ] Display blockchain as currently possible with masterchain.info (TBD: Add detail)
			- Add API support for viewing transactions of different types (Class A & B )
- [ ] Extend Block-Explorer such that all MSC user-derived currencies can be displayed.
			- Add API support for currency creation (tx type 100)
- [ ] Allow users to check balances provided the appropriate private keys are stored on their 
		local machine. (Private keys shouldn't be required to check the balance of a MSC address)
- [ ] Allow users to send funds provided the appropriate private keys are stored on their 
		local machine. (Implement message signing and simple send tx type=0 on the client)
- [ ] client-side private key import/export 
- [ ] import bitcoin-qt wallets

## Stage 2 Features

- [ ] Web wallet in a box, ready to deploy MSC web wallet (via docker/heroku)
- [ ] Heroku & Docker buildpacks for automatic deployments.  See http://blog.docker.io/2013/05/heroku-buildpacks-on-docker/#more-79
- [ ] Marking addresses as 'savings' accounts (tx type=10)
- [ ] export wallet file
- [ ] Client-side AES wallet encryption

## Stage 3 Features

- [ ] Message signing and taint analysis
- [ ] Double encryption, encrypted serverside backups
- [ ] Allow users to create an account and associate bitcoin addresses with that account.
- [ ] Payment notifications
- [ ] Paper wallets
- [ ] Offline transactions

## Design Notes

- [ ] JS&HTML5 offline app using blockchain.info API
- [ ] Crypto provided by https://github.com/bitcoinjs/bitcoinjs-lib
- [ ] BTC Webwallet base provided by https://github.com/blockchain/My-Wallet with 
		API Docs @ https://blockchain.info/api
- [ ] MSC Block-Explorer base provided by https://github.com/grazcoin/mastercoin-tools/
- [ ] Implementation of the following 
		minimum API https://github.com/mastercoin-MSC/spec#appendix-c---webservice-verification-api
- [ ] Other resources: maran's ruby impl https://github.com/maran/mastercoin-ruby 
		and mastercoind https://github.com/mastercoin-MSC/mastercoind

## More Specific Design (TBD)

Endpoints

Mastercoin Explorer API

GET /transactions 
Get all available transaction types for this system.

GET /transactions/:id
Retrieve transaction information for transaction 'id'

POST /create/:tx_type
Create a new transaction of type 'tx_type'

Wallet API

/wallet/:id/send
Simple send transaction.

/wallet/:id/balance
Get MSC balance.

Common API

GET /mastercoin_verify/addresses?currency_id=#currency_id#
You supply this URL a currency_id, initially 1 or 2, and it should return an JSON array of 
objects with two keys: address and balance.

GET /mastercoin_verify/transactions/#address#?currency_id=#currency_id#
This URL takes an address and currency_id as arguments and should return an JSON object with 
an address and a transactions key for this given address.


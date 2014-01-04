# Mastercoin Web Wallet Design

## Overview

- Our end goal is to provide Mastercoin users with a client-side encrypted web-wallet to store 
  funds and make/view Class A/B transactions.
- To that end our plan is to leverage My-Wallet as a source of truth in building a browser
  client-side implementation of the Mastercoin web-wallet.
- We would additionally like to include a Mastercoin block-explorer on the website, 
  so users can view A/B transactions on the Masterchain with extensions for user-currency block-exploration.

## Stage 1 Features

- [ ] Display blockchain as currently possible with masterchain.info (TBD: Add detail) (View support for Class A/B transactions)
- [ ] Extend Block-Explorer such that all MSC user-derived currencies can be displayed. (Implement currency creation tx type=100)
- [ ] Allow users to check balances provided the appropriate private keys are stored on their 
		local machine. (Implement blockchain.info style API for parsing MSC class B transactions)
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


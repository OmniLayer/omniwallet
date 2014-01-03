# Mastercoin Web Wallet Design

## Overview

- Our end goal is to provide Mastercoin users with a hassle-free encrypted web-wallet to store 
  funds in a secure manner and view transactions.
- To that end our plan is to extend the My-Wallet implementation directly to create a feature-filled
  and reliable client-side encrypted implementation of a Mastercoin web-wallet.
- We would additionally like to include a Mastercoin block-explorer on the website, 
  so users can view transactions on the Masterchain with extensions for user-currency block-exploration.

## Features

- [ ] Block-Explorer as currently possible with masterchain.info (TBD: Add detail)
- [ ] Extend Block-Explorer such that all MSC user-derived currencies can be displayed.
- [ ] Allow users to create an account and associate bitcoin addresses with that account.
- [ ] Allow users to check balances provided the appropriate private keys are stored on their 
		local machine.
- [ ] Allow users to send funds provided the appropriate private keys are stored on their 
		local machine. (Simple send)
- [ ] Web wallet in a box, ready to deploy MSC web wallet (via docker/heroku)

## Core Structure

- [ ] JS&HTML5 offline app using My-Wallet & bitcoinjs
- [ ] Crypto provided by https://github.com/bitcoinjs/bitcoinjs-lib
- [ ] BTC Webwallet base provided by https://github.com/blockchain/My-Wallet with 
		API Docs @ https://blockchain.info/api
- [ ] MSC Block-Explorer base provided by https://github.com/grazcoin/mastercoin-tools/
- [ ] Implementation of the following 
		minimum API https://github.com/mastercoin-MSC/spec#appendix-c---webservice-verification-api
- [ ] Docker Images for automatic deployments
- [ ] Other resources: maran's ruby impl https://github.com/maran/mastercoin-ruby 
		and mastercoind https://github.com/mastercoin-MSC/mastercoind

## More Specific Design (TBD)

- [ ] Client-side AES wallet encryption
- [ ] Offline usability, transactions
- [ ] Paper wallets
- [ ] Payment notifications
- [ ] Coin control and taint analysis
- [ ] Double encryption, encrypted serverside backups
- [ ] private key import/export
- [ ] import bitcoin-qt wallets

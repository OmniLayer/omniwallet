# Mastercoin Web Wallet Design

## Features

- [ ] Coin explorer as currently possible with masterchain.info (TBD: Add detail)
- [ ] Extend coin explorer such that all MSC user-derived currencies can be displayed.
- [ ] Allow users to create an account and associate bitcoin addresses with that account.
- [ ] Allow users to check balances provided the appropriate private keys are stored on their local machine.
- [ ] Allow users to send funds provided the appropriate private keys are stored on their local machine. (Simple send)
- [ ] Web wallet in a box, ready to deploy MSC web wallet (via docker/heroku)

## Core Structure

- [ ] html5 offline app using My-Wallet(blockchain.info) & bitcoinjs(bitcoinjs.com) as a base
- [ ] Javascript based code on the frontend for any tasks involving private keys.

## More Specific Design (TBD)

- [ ] Client-side AES wallet encryption
- [ ] Offline usability, transactions
- [ ] Paper wallets
- [ ] Payment notifications
- [ ] Coin control and taint analysis
- [ ] Double encryption, encrypted serverside backups
- [ ] private key import/export
- [ ] import bitcoin-qt wallets

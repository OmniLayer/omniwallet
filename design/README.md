# Mastercoin Web Wallet Design

I believe we can extend the my-wallet implementation directly to make a sufficiently secure, feature-filled
and reliable client-side encrypted implementation of a mastercoin web-wallet.

## Features

- [ ] Coin-Explorer as currently possible with masterchain.info (TBD: Add detail)
- [ ] Extend Coin-Explorer such that all MSC user-derived currencies can be displayed.
- [ ] Allow users to create an account and associate bitcoin addresses with that account.
- [ ] Allow users to check balances provided the appropriate private keys are stored on their local machine.
- [ ] Allow users to send funds provided the appropriate private keys are stored on their local machine. (Simple send)
- [ ] Web wallet in a box, ready to deploy MSC web wallet (via docker/heroku)

## Core Structure

- [ ] HTML5 offline app using My-Wallet(blockchain.info) & bitcoinjs(bitcoinjs.com) as a base
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

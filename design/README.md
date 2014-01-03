# Mastercoin Web Wallet Design

I believe we can extend the my-wallet implementation directly to make a sufficiently secure, feature-filled
and reliable client-side encrypted implementation of a mastercoin web-wallet. Additionally, we would include
a mastercoin block-explorer on the website.

## Features

- [ ] Block-Explorer as currently possible with masterchain.info (TBD: Add detail)
- [ ] Extend Block-Explorer such that all MSC user-derived currencies can be displayed.
- [ ] Allow users to create an account and associate bitcoin addresses with that account.
- [ ] Allow users to check balances provided the appropriate private keys are stored on their local machine.
- [ ] Allow users to send funds provided the appropriate private keys are stored on their local machine. (Simple send)
- [ ] Web wallet in a box, ready to deploy MSC web wallet (via docker/heroku)

## Core Structure

- [ ]JS&HTML5 offline app using My-Wallet & bitcoinjs
- [ ]Crypto provided by https://github.com/bitcoinjs/bitcoinjs-lib
- [ ]Webwallet base provided by https://github.com/blockchain/My-Wallet with API Docs @ https://blockchain.info/api
- [ ]Block-Explorer base provided by https://github.com/grazcoin/mastercoin-tools/
- [ ]Docker images
- [ ]
- [ ]
- [ ]

## More Specific Design (TBD)

- [ ] Client-side AES wallet encryption
- [ ] Offline usability, transactions
- [ ] Paper wallets
- [ ] Payment notifications
- [ ] Coin control and taint analysis
- [ ] Double encryption, encrypted serverside backups
- [ ] private key import/export
- [ ] import bitcoin-qt wallets

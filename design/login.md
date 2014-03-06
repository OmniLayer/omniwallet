This is the proposed login protocol for the Omniwallet project. The Omniwallet is a blockchain.info style wallet.

## Protocol requirements

1. Passwords are never sent to the server. In fact the server should never gain any bits of information about the password.
2. DDOS protection - an attacker should not be able to cause the server to perform heavy calculations without first performing heavy calculations himself.


## Changes to existing codebase

1. Remove browser-side saved data
2. Make the login page accept a URL, to allow bookmarking:
	omniwallet.org/wallet/login?uid=HIS-SPECIFIC-IDENTIFIER 
3. Swap out the email address as primary identifier in favor of a UUID
4. Make sure the UUID is displayed in the title bar, when we’re logged in.
5. When the UUID is first shown to the user, add a text blurb next to it “write this down, it’s what you’ll use to get to log in and get to your wallet later.”  (My frustration with this system on blockchain.info stems mostly from not realizing that was the thing I wanted to write down, as opposed to my email address.)
6. Encrypt the wallet files stored on the server with the user’s private client-side key (created in step 4 below), and send them in the original encrypted form when the client requests them.
7. Make the passphrase on private keys in the browser optional.  If we’re using them, then the system should ask for them on each transaction.  But if the user doesn’t give one, we can just perform the transaction without having to decrypt the key.
8. Automatic logout after a period of inactivity - make sure this deletes the data in application memory (perhaps by just forcing a page redirect)


## Account Creation Flow

1. When an account is created, the user sends their desired name to the server.
2. the server creates a salt. ``hash(CONCAT(SERVER_SECRET, UUID))`` to create the salt.  Get ``SERVER_SECRET`` from an environment variable and sends to the user.
3. The client creates a private/public key pair from (password, salt, nonce).  The client iterates nonce values ``(nonce ← 0; nonce < inf; ++nonce)`` and regenerates candidate keys until it finds one where the public key ends in ``040000``.  Only public keys that end with ``04000`` will be accepted by the server (this prevents an attacker from trivially creating huge numbers of accounts).
4. The public key is sent to the server.

## Login Flow

1. The user sends his login ID (uuid) to the server
1a. Invalid users are given back a fake salt, to prevent people from querying for valid usernames.  Calculate it as in step 2 of the login flow.
2. The server replies with the salt stored/calculated in step 2 above, and with a new challenge (current timestamp + new random number).
3. The client calculates the private/public key pair based on the user’s password and the salt provided by the server, and stores it in a javascript variable.
4. The user signs the pair (current timestamp + random challenge) with his private key, sends the signed message to the server
5. The server validates the signature and then sends the user's data to him.

## Updating data

(Happens when the account is first created, and whenever data is updated - e.g. when a new address is generated, a label is set, etc.)

To update his data on the server, the user gets a challenge from the server (to prevent replay attacks), encrypts the data with symmetric encryption (key = his private key), and signs a message with the encrypted data and challenge, and sends the signed message to the server.  Effectively steps 3-5 of the login process.

## TODO

Session management / preventing replay attacks using session limited salts/challenges with a limited timespan.

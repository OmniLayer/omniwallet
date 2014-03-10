This is the proposed login protocol for the Omniwallet project. The Omniwallet is a blockchain.info style wallet that never sends passwords to the server, and supports multiple currencies.

## Protocol requirements

1. Passwords are never sent to the server. In fact the server should never gain any bits of information about the password.
2. DDOS protection - an attacker should not be able to cause the server to perform heavy calculations without first performing heavy calculations himself.

## General notes and assumptions

1. This protocol assumes an underlying session management system, the details of which are left unspecified. The choice of session management system should be modular enough to replace if needed.
2. Whenever a server creates a value and sends it to the client, the server should never read that value back from the client. It should always store that value in the session storage and read it back later, in order to prevent a client from forging that value.
3. The proof of work (pow_challenge) stuff is optional, it can be coded in later.

## Salt Creation ##
Let ``SERVER_SECRET`` be a secret that all servers know and share (same secret for all servers), but is never sent anywhere else (usually this is done by injecting an environment variable. Dev note: do not commit the secret to the code).

The server creates a salt per UUID in a deterministic way, by running ``hash(CONCAT(SERVER_SECRET, UUID))``.

## Random string creation ##
To create a random string, do CONCAT(current timestamp, rand()), where rand() is a strong random primitive.

## Account Creation Flow
Let ``ACCOUNT_CREATION_DIFFICULTY`` be 0x04000 (arbitrary choice, may need to change). 

1. When an account is created, the user creates a random UUID using a secure random library, and sends to the server.
2. If the UUID exists, the server returns an EXISTING_UUID error.
3. The server creates a salt (see Salt Creation above)
4. The server creates pow_challenge as a random string and stores it in the session.
5. The server sends (salt, pow_challenge) to the server.
6. The client iterates nonce values ``(nonce ← 0; nonce < inf; ++nonce)`` and calculates HASH(CONCAT(pow_challenge, nonce)), and when it reaches a hash that ends in LOGIN_DIFFICULTY, proceeds.
7. The client generates a private/public key pair from CONCAT(password, salt).
8. The client sends (nonce, public key) is sent to the server.
9. The server validates that HASH(CONCAT(nonce, pow_challenge)) ends in ``ACCOUNT_CREATION_DIFFICULTY``, rejects it if not.
10. The server forgets the nonce, stores the public key in association with the UUID.

## Login Flow

Let ```LOGIN_DIFFICULTY`` be 0x04000 (arbitrary choice, may need to change).

1. The client sends his UUID to the server.
2. The server calculates the matching salt.
3. The server creates two random values: challenge and pow_challenge and stores both in the session.
4. The server sends (salt, challenge, pow_challenge) to the client.
5. The client iterates nonce values ``(nonce ← 0; nonce < inf; ++nonce)`` and calculates HASH(CONCAT(pow_challenge, nonce)), and when it reaches a hash that ends in LOGIN_DIFFICULTY, proceeds.
6. The client calculates the private/public key pair based on the user’s password and the salt provided by the server, and stores it in a javascript variable.
7. The user signs the pair (current timestamp + random challenge) with his private key, sends the signed message to the server
8. The server validates HASH(CONCAT(pow_challenge, nonce)) ends in LOGIN_DIFFICULTY.
8. The server validates the signature and then sends the user's data to him.

## Updating data

TBD: specify in more detail.

(Happens when the account is first created, and whenever data is updated - e.g. when a new address is generated, a label is set, etc.)

To update his data on the server, the user gets a challenge from the server (to prevent replay attacks), encrypts the data with symmetric encryption (key = his private key), and signs a message with the encrypted data and challenge, and sends the signed message to the server.  Effectively steps 3-5 of the login process.

## Appendix A - TODO

Session management / preventing replay attacks using session limited salts/challenges with a limited timespan.

## Appendix B - Changes to existing codebase

1. Remove browser-side saved data
2. Make the login page accept a URL, to allow bookmarking:
	omniwallet.org/wallet/login?uid=HIS-SPECIFIC-IDENTIFIER 
3. Swap out the email address as primary identifier in favor of a UUID
4. Make sure the UUID is displayed in the title bar, when we’re logged in.
5. When the UUID is first shown to the user, add a text blurb next to it “write this down, it’s what you’ll use to get to log in and get to your wallet later.”  (My frustration with this system on blockchain.info stems mostly from not realizing that was the thing I wanted to write down, as opposed to my email address.)
6. Encrypt the wallet files stored on the server with the user’s private client-side key (created in step 4 below), and send them in the original encrypted form when the client requests them.
7. Make the passphrase on private keys in the browser optional.  If we’re using them, then the system should ask for them on each transaction.  But if the user doesn’t give one, we can just perform the transaction without having to decrypt the key.
8. Automatic logout after a period of inactivity - make sure this deletes the data in application memory (perhaps by just forcing a page redirect)

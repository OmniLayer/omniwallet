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
4. The server creates create_pow_challenge as a random string and stores it in the session.
5. The server sends (salt, create_pow_challenge) to the client.
6. The client iterates nonce values ``(nonce ← 0; nonce < inf; ++nonce)`` and calculates HASH(CONCAT(pow_challenge, nonce)), and when it reaches a hash that ends in ``ACCOUNT_CREATION_DIFFICULTY``, proceeds.
7. The client generates a symmetric key from CONCAT( password, salt ).
8. The client generates a public/private key pair based on random values.
9. The client sends ( nonce, public key, encrypted empty wallet file ) to the server.
10. The server validates that HASH( CONCAT( nonce, create_pow_challenge_from_session )) ends in ``ACCOUNT_CREATION_DIFFICULTY``, rejects it if not.
11. The server forgets the nonce, stores the public key in the session, and the encrypted wallet file associated with the given UUID.

## Login Flow

Let ```LOGIN_DIFFICULTY`` be 0x04000 (arbitrary choice, may need to change).

1. The client sends his UUID to the server.
2. The server calculates the matching salt.
3. The server creates a random pow_challenge and stores it in the session.
4. The server sends ( salt, pow_challenge ) to the client.
5. The client iterates nonce values ``(nonce ← 0; nonce < inf; ++nonce)`` and calculates HASH(CONCAT(pow_challenge, nonce)), and when it reaches a hash that ends in ``LOGIN_DIFFICULTY``, proceeds.
6. The client calculates the symmetric key based on the user’s password and the salt provided by the server, and stores it in a javascript variable.
7. The client calculates a public/private key pair for signing requests.
8. The client sends ( nonce, public key ) to the server.
8. The server validates HASH(CONCAT(pow_challenge, nonce)) ends in LOGIN_DIFFICULTY.
9. If valid, the server sends the encrypted wallet file to the client, and stores the public key in the session.

## Updating data

(Happens when the account is first created, and whenever data is updated - e.g. when a new address is generated, a label is set, etc.)

To update data on the server:

1. The client gets a challenge string from the server (to prevent replay attacks).  The server stores this challenge in the session.  (note that this challenge will change on every request to update data)
2. The client encrypts the wallet data file with the user's symmetric key.
3. The client signs the challenge with the user's private key
4. The client sends back to the server an object containing the encrypted data and the signed challenge string.
5. The server validates the request by making sure that the challenge sent matches what was in the session, and that the signature is valid.  If so, the encrypted wallet data is stored, keyed off the UUID.

## Appendix A - HTTP Endpoints

### Challenge Endpoint

This endpoint will start a challenge session for a UUID and return relevant challenges to the client as well as save the relevant session information on the server

```
GET /v1/user/wallet/challenge?uuid=<UUID>
```

Where UUID is the users UUID

Example:

```
curl "http://localhost:8080/v1/user/wallet/challenge?uuid=6b66c8c1-963a-4fdb-d061-150d5ca5baf9"
{
  "challenge": "9Zw6gAJTsG1Mbz62w4KVlcLXj3p16wKL",
  "pow_challenge": "C7F4tXgUfv1KiIhGxNTijcWLJ1D8vdtH",
  "salt": "b29ae6474a9812c6ee6735f3673d8b2a7e8254ef6da726e1705e3aa3cd70dd94"
}
```

### Login Enpoint

This endpoint will fetch the users encrypted wallet data provided all the challenges are met

```
GET /v1/user/wallet/login?uuid=<UUID>&nonce=<nonce>&public_key=<public_key>
```

The query string parameters are as follows:


| Value | Explanation |
| ----- | ----------- |
| UUID | Users UUID |
| nonce | The challenge response to pow_challenge |
| public_key | The users public key used to sign future updates

### Creation Endpoint

This endpoint will create a new encrypted wallet file on the server if the challenges are met

```
POST /v1/user/wallet/create
```

The POST data should contain:

| Value | Explanation |
| ----- | ----------- |
| UUID | Users UUID |
| nonce | The challenge response to pow_challenge |
| public_key | The users public key used to sign future updates
| wallet | the encrypted wallet data |

### Update Endpoint

This endpoint will update a existing wallet file on the server if the challenges are met

```
POST /v1/user/wallet/update
```

The POST data should contain:

| Value | Explanation |
| ----- | ----------- |
| UUID | Users UUID |
| signature | This is the sessions ``challenge`` signed by the clients public key |
| wallet | the encrypted wallet data |


## Appendix B - TODO

Session management / preventing replay attacks using session limited salts/challenges with a limited timespan.

## Appendix C - Changes to existing codebase

1. Remove browser-side saved data
2. Make the login page accept a URL, to allow bookmarking:
	omniwallet.org/wallet/login?uid=HIS-SPECIFIC-IDENTIFIER 
3. Swap out the email address as primary identifier in favor of a UUID
4. Make sure the UUID is displayed in the title bar, when we’re logged in.
5. When the UUID is first shown to the user, add a text blurb next to it “write this down, it’s what you’ll use to get to log in and get to your wallet later.”  (My frustration with this system on blockchain.info stems mostly from not realizing that was the thing I wanted to write down, as opposed to my email address.)
6. Encrypt the wallet files stored on the server with the user’s private client-side key (created in step 4 below), and send them in the original encrypted form when the client requests them.
7. Make the passphrase on private keys in the browser optional.  If we’re using them, then the system should ask for them on each transaction.  But if the user doesn’t give one, we can just perform the transaction without having to decrypt the key.
8. Automatic logout after a period of inactivity - make sure this deletes the data in application memory (perhaps by just forcing a page redirect)

Design goals for the login system:

# Password is never sent to the server
# Resistant to brute-forcing
# A user cannot download data without authenticating (even in encrypted form). This is important in order to prevent brute-forcing the encrypted data on the user's own computer.
# DDOS resistant

Interim solution
================

The following system answers at least 1 and 2

* Account creation*
1. When an account is created, the server creates a SALT (= random number + datetime) and sends to the user.
2. The user creates a private/public key pair from (password, salt).
3. The public key is sent to the server

*Login*
1. The user sends his login ID (= email) to the server
2. The server replies with the salt, and with the pair (current timestamp + new random challenge).
3. The user calculates the private/public key pair.
4. The user signs the pair (current timestamp + random challenge) with his private key, sends the signed message to the server
5. The server validates the signature and then sends the user's data to him.

*Updating data*
(Happens when the account is first created, and whenever data is updated - e.g. when a new address is generated, a label is set, etc.)

To update his data on the server, the user gets a challenge from the server (to prevent replay attacks), encrypts the data with symmetric encryption (key = his private key), and signs a message with the encrypted data and challenge, and sends the signed message to the server.

DDOS protection
===============
TBD - we need to make sure a client can't force the server to do a huge amount of work.
If needed we can integrate some proof of work here.
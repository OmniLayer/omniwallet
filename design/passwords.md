This is the proposed design for the password scheme in encrypting addresses.

It is important to implement Phase 1 quickly. Phase 2 should be postponed for later, it is a bit more complicated and requires more thought.

Current state
-------------
The current state of affairs as of March 15, is this:

1. There is a global password for the account, and the entire blob of data send to the server is encrypted with this password.
2. Adding a new address always requires a password. I assume that password is used to double-encrypt that address.
3. Importing a private key calls for an optional password.

Proposed phase 1
----------------
The immediate change that should be made: Disable double-encryption altogether.

Adding and importing an address should never require a pre-address password, or even present the user with the option of providing a per-address password. The underlying code can retain the optional ability to encrypt a specific address, but the UI should never force this or even allow it.

Proposed phase 2
----------------
When we have a bit of time, we can enable per-address encryption.
My thesis is that only a small part of the users will want this feature.

1. We may want to hide it under the settings, and have the user enable it (until he does, the dialogs do not show him a option to provide a second password - just like phase 1)
2. It is an open question whether this would be a part of the address add/import flow (just like the current state), or perhaps a different flow altogether. An alternative flow would be that adding/importing an address can be done just like Phase 1, but we would have a 'lock' icon near each address that allows the user to provide another password. There are usability/security compromises to be made here, this needs to be discussed.
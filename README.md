What is Mastercoin?

[from wiki.mastercoin.org]
Mastercoin is both a new type of currency (MSC) and a platform. It is a new protocol layer 
running on top of bitcoin like HTTP runs on top of TCP/IP. Its purpose is to build upon the 
core Bitcoin protocol and add new advanced features, with a focus on a straight-forward and 
easy to understand implementation which allows for analysis and its rapid development. 

Why do we need a web-wallet?
We anticipate most users will not want to understand the technical details of running a standalone wallet.
To counter user dissatisfaction and garner a strong following, Mastercoin will require an easy
to use wallet not requiring user installation. Web-wallets are the typical manifestation of this
requirement, but we recognize the concern for security is not typically heeded. The concern for
security is another motivation in this regard, and a section will be written regarding those 
concerns.

Who is this document for>
This specification has been written with developers and users of Mastercoin in mind. We anticipate 
changes to this document and eagerly accept outside contributions through Github pull requests. 

Risks 

Web wallet security
Traditionally, web wallets are designed with the security implication of handling user data. 
In our case, user data includes bitcoin private keys. Since this is a appealing target for
criminals, our aim in this project will be to minimize the risk of the user in using our 
service, by developing software to run without the handling of user private keys. This has been
attempted with success by the web wallet and blockchain query service blockchain.info. We are 
confident this level of security can and should be implemented by our software.

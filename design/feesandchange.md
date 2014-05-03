#Fee's and Change Information

##Fee's

###Bitcoin Fee's

Associated with all Bitcoin transaction is a .0001BTC fee which is deducted from the total amount you send.
This is paid to the miners who process the Bitcoin transactions.

###MasterProtocol Fee's

Since MasterProtocol transactions are a collection of Bitcoin outputs they have a BTC fee associated with them. 
Every output in a Bitcoin transaction must be above the dust level (.00005460BTC) in order for it to be considered 
a valid output. MasterProtocol transactions generally have at least 4 outputs.
So the bare minimium fee for most transactions is 4 times the dust level plus the miners fee: (4*.00005460)+.0001 ~= .00032BTC. This value could increase as MasterProtocol features are added and implimented. 
It is recommended that you generally have ~.001BTC in the sending address when performing a MasterProtocol transaction. 

##Change

When creating a send transaction Omniwallet uses unspent inputs from your previous transactions which
are equal to or greater than the amount of BTC you are trying to send. If the sum of the unspent transactions
is greater than the amount of BTC you want to send the change needs to be sent somewhere. Omniwallet 
sends the change to your input/source address.

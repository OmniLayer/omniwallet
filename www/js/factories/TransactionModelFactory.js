angular.module("omniFactories")
	.factory("Transaction",["TESTNET","SATOSHI_UNIT",function TransactionModelFactory(TESTNET,SATOSHI_UNIT){
		var TransactionModel = function(txType,fromAddress,minerFee,txData){
			var self = this;

			self.initialize = function(){
				self.type = txType;

				if(fromAddress.privkey){
					self.privKey = new Bitcoin.ECKey.decodeEncryptedFormat(fromAddress.privkey, fromAddress.hash); // Using address as temporary password
                    self.pubKey = self.privKey.getPubKeyHex();

					self.offline = false;
				}else if(fromAddress.pubkey){
					self.pubKey = fromAddress.pubkey.toUpperCase();

					self.offline = true;
				}else
					throw "Transaction needs an Address with private or public key"; // Throw an error?

				self.address = fromAddress;
				self.data = txData;

                self.data['pubkey'] = self.pubKey;
                self.data['fee']= minerFee.times(SATOSHI_UNIT).valueOf();
                self.data['transaction_from'] = self.address.hash;
                self.data['testnet'] = TESTNET || false;

                self.totalCost = minerFee; // TODO: calculate protocol cost
			}

			self.initialize()
		}

		return TransactionModel;
	}])
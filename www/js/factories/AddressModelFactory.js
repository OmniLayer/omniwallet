angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", "$rootScope", "AddressManager", "WHOLE_UNIT", 
		function AddressModelFactory(BalanceSocket, $rootScope, AddressManager, WHOLE_UNIT){
			var AddressModel = function(hash,privkey,pubkey){
				var self = this;

				self.initialize = function(){
					if(!BalanceSocket.connected)
						BalanceSocket.connect();
					self.loaded = false;
					self.hash = hash;
					self.privkey = privkey;
					self.pubkey = pubkey;
					self.balance = [];
					self.assets = [];
					self.qr = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+hash+"&choe=UTF-8";
					
					//AddressManager.getTransactions(hash).then(function(result){
					//	var data = result.data;
					//	self.transactions = data.transactions;
					//})

					BalanceSocket.on("address:book", function(data){
						if (typeof data[hash]!="undefined") {
							processBalanceData(data[hash].balance);
						} else {
							BalanceSocket.emit("address:add", {data:hash});
						}
					});
					BalanceSocket.on("address:"+hash, function(data){
						processBalanceData(data.balance);
					});

					BalanceSocket.emit("address:add", {data:hash});
				}

				var processBalanceData = function(serverBalance) {
					if(self.balance != serverBalance){
						var previousBalance = self.balance;
						serverBalance.forEach(function(balance,index){
							var found = previousBalance.filter(function(prevBalance){
								return prevBalance.symbol == balance.symbol
							})[0];

							var delta = found ? balance.value-found.value : balance.value;
							var dneg = found ? balance.pendingneg - found.pendingneg : balance.pendingneg;
							var dpos = found ? balance.pendingpos - found.pendingpos : balance.pendingpos;

							if (delta != 0 || dpos !=0 || dneg != 0)
								$rootScope.$broadcast('balance:'+balance.symbol, delta, dneg, dpos);
						});

						self.balance = serverBalance;
						$rootScope.$broadcast('balance:changed');
	
						if(!self.loaded){
							self.loaded=true;
							$rootScope.$broadcast("address:loaded", {hash:hash});
						}
					}
				}

				self.transactions = function(showtesteco){
					address=self.hash;
					//console.log("Starting "+address);
					return AddressManager.getTransactions(address).then(function(result){
						var data = result.data;
						//console.log("found data for "+data.address+" its length is "+data.transactions.length);
						txs=data.transactions;
						return txs.map(function(tx){
							if ((tx.currency.propertyid < 2147483648 && tx.currency.propertyid != 2) || showtesteco === 'true') {
								return tx;
							}
						});
					});
				}

				self.estimateFee = function(btcAmount=null){
					address=self.hash;
					return AddressManager.estimateFee(address,btcAmount).then(function(result){
						return result.data;
					});
				}

				self.getDisplayBalance = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];

					var value=0;
					if(currencyItem){
						if(currencyItem.divisible) {
							value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();
						} else {
							value=currencyItem.value;
						}
					}
					if (value < 0) {
						value=0;
					}
					return value;
				}

				self.getPendingNeg = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];
					if(currencyItem){
						if(currencyItem.divisible)
							var value=new Big(currencyItem.pendingneg).times(WHOLE_UNIT).valueOf();
						
						return value || currencyItem.pendingneg;
					} else {
						return 0
					}
				}

				self.getPendingPos = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];
					
					if(currencyItem){
						if(currencyItem && currencyItem.divisible)
							var value=new Big(currencyItem.pendingpos).times(WHOLE_UNIT).valueOf();
						
						return value || currencyItem.pendingpos;
					} else {
						return 0
					}
				}

				self.getBalance = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					});
					if(currencyItem){
						return currencyItem.length > 0 ? currencyItem[0].divisible ? new Big(currencyItem[0].value).times(WHOLE_UNIT) : new Big(currencyItem[0].value) : new Big(0);
					} else {
						return 0
					}
				}

                                self.signMsg = function(msg) {
                                    var bitcore = require('bitcore-lib');
                                    var Message = require('bitcore-message');
                                    var privateKey = bitcore.PrivateKey.fromWIF(Bitcoin.ECKey.decodeEncryptedFormat(self.privkey, self.hash).getWalletImportFormat());
                                    var signature = Message(msg).sign(privateKey);
                                    return signature;
                                }

                                self.genPubkey = function() {
                                    var pubkey = Bitcoin.ECKey.decodeEncryptedFormat(self.privkey, self.hash).getPubKeyHex();
                                    return pubkey;
                                }

				self.initialize();
			}

			return AddressModel
	}]);

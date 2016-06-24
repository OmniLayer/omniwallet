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
					//self.transactions = [];
					self.qr = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+hash+"&choe=UTF-8";
					
					//AddressManager.getTransactions(hash).then(function(result){
					//	var data = result.data;
					//	self.transactions = data.transactions;
					//})

					BalanceSocket.on("address:"+hash, function(data){
						if(self.balance != data.balance){
							var previousBalance = self.balance;
							data.balance.forEach(function(balance,index){
								var found = previousBalance.filter(function(prevBalance){
									return prevBalance.symbol == balance.symbol
								})[0];

								var delta = found ? balance.value-found.value : balance.value;
								var dneg = found ? balance.pendingneg - found.pendingneg : balance.pendingneg;
								var dpos = found ? balance.pendingpos - found.pendingpos : balance.pendingpos;

								if (delta != 0 || dpos !=0 || dneg != 0)
									$rootScope.$broadcast('balance:'+balance.symbol, delta, dneg, dpos);
							});

							self.balance = data.balance;
							$rootScope.$broadcast('balance:changed');

							if(!self.loaded){
								self.loaded=true;
								$rootScope.$broadcast("address:loaded", {hash:hash});
							}
						}
					});

					BalanceSocket.emit("address:add", {data:hash});
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

				self.getDisplayBalance = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];

					if(currencyItem.divisible)
						var value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();
					
					return value || currencyItem.value;
				}

				self.getPendingNeg = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];

					if(currencyItem.divisible)
						var value=new Big(currencyItem.pendingneg).times(WHOLE_UNIT).valueOf();
					
					return value || currencyItem.pendingneg;
				}

				self.getPendingPos = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					})[0];
					
					if(currencyItem && currencyItem.divisible)
						var value=new Big(currencyItem.pendingpos).times(WHOLE_UNIT).valueOf();
					
					return value || currencyItem.pendingpos;
				}

				self.getBalance = function(assetId){
					var currencyItem = self.balance.filter(function(asset){
						return asset.id == assetId;
					});

					return (currencyItem && currencyItem[0].value) || 0;
				}

				self.initialize();
			}

			return AddressModel
	}]);

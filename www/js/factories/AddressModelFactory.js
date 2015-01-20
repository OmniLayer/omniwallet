angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", "$rootScope","WHOLE_UNIT", function AddressModelFactory(BalanceSocket, $rootScope, WHOLE_UNIT){
		var AddressModel = function(hash,privkey,pubkey){
			var self = this;

			self.initialize = function(){
				self.loaded = false;
				self.hash = hash;
				self.privkey = privkey;
				self.pubkey = pubkey;
				self.balance = [];
				self.qr = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+hash+"&choe=UTF-8";
				
				BalanceSocket.on("address:"+hash, function(data){
					if(self.balance != data.balance){
						var previousBalance = self.balance;
						data.balance.forEach(function(balance,index){
							var found = previousBalance.filter(function(prevBalance){
								return prevBalance.symbol == balance.symbol
							})[0];

							var delta = found ? balance.value-found.value : balance.value;

							if (delta != 0)
								$rootScope.$broadcast('balance:'+balance.symbol,  delta);
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

			self.getDisplayBalance = function(assetId){
				var currencyItem = self.balance.filter(function(asset){
					return asset.id == assetId;
				})[0];

				if(currencyItem.divisible)
                    var value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();
				
				return value || currencyItem.value;
			}

			self.getBalance = function(assetId){
				var currencyItem = self.balance.filter(function(asset){
					return asset.id == assetId;
				})[0];

				return currencyItem.value;
			}

			self.initialize();
		}

		return AddressModel
	}]);

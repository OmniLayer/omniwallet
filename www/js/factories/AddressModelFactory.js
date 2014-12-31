angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", "$rootScope","WHOLE_UNIT", function AddressModelFactory(BalanceSocket, $rootScope, WHOLE_UNIT){
		var AddressModel = function(address,privkey,pubkey){
			var self = this;

			self.initialize = function(){
				self.address = address;
				self.privkey = privkey;
				self.pubkey = pubkey;
				self.balance = [];
				self.qr = "https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl="+address+"&choe=UTF-8";
				
				BalanceSocket.on("address:"+address, function(data){
					if(self.balance != data.balance){
						var previousBalance = self.balance;
						data.balance.forEach(function(balance,index){
							var previous = previousBalance.find(function(prevBalance){
								return prevBalance.symbol == balance.symbol
							})[0].value
							$rootScope.$broadcast('balance:'+balance.symbol,  balance.value-previous);
						});

						
						self.balance = data.balance;
					}
				});

				BalanceSocket.emit("address:add", {data:address});
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

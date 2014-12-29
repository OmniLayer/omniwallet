angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", "$rootScope", function AddressModelFactory(BalanceSocket, $rootScope){
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
						self.balance = data.balance
						$rootScope.$broadcast('BALANCE_CHANGED', data.balance.map(function(element){
	                		return element.symbol;
	                	}), data.balance.map(function(element){
	                		return element.value;
	                	}));
					}
				});

				BalanceSocket.emit("address:add", {data:address});
			}

			self.getBalance = function(assetId){
				var currencyItem = self.balance.filter(function(asset){
					return asset.id == assetId;
				})[0];

				if(currencyItem.divisible)
                    var value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();
				
				return value || currencyItem.value;
			}

			self.initialize();
		}

		return AddressModel
	}]);

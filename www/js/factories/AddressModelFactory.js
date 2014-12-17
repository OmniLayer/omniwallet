angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", "$rootScope", function AddressModelFactory(BalanceSocket, $rootScope){
		var AddressModel = function(address,privkey,pubkey){
			var self = this;

			self.initialize = function(){
				self.address = address;
				self.privkey = privkey;
				self.pubkey = pubkey;
				self.balance = [];

				BalanceSocket.on("address:"+address, function(data){
					if(self.balance != data.balance){
						self.balance = data.balance
						$rootScope.$emit('BALANCE_CHANGED');
					}
				});

				BalanceSocket.emit("address:add", {data:address});
			}

			self.getBalance = function(assetId){
				var balance = self.balance.filter(function(asset){
					return asset.id == assetId;
				})[0];
				
				return balance;
			}

			self.initialize();
		}

		return AddressModel
	}]);

angular.module("omniFactories")
	.factory("Address", ["BalanceSocket", function AddressModelFactory(BalanceSocket){
		var AddressModel = function(address,privkey,pubkey){
			var self = this;

			self.initialize = function(){
				self.address = address;
				self.privkey = privkey;
				self.pubkey = pubkey;

				self.socket = BalanceSocket;

				self.socket.on("address:"+address, function(data){
					angular.extend(self,data)
				});

				self.socket.emit("address:add", {data:address});
			}
			self.initialize();
		}

		return AddressModel
	}]);
angular.module("omniFactories")
	.factory("AddressModel",[function AddressModelFactory(){
		var AddressModel = function(address,privkey='',pubkey=''){
			var self = this;

			self.initialize = function(){
				self.socket = io.connect('http://' + document.domain + ':' + location.port + "/balance");

				self.socket.on("update:"+address, function(data){
					angular.extend(self,data)
				});
			}
			self.initialize();
		}

		return AddressModel
	}]);
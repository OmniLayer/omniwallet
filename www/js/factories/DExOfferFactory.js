angular.module("omniFactories")
	.factory("DExOffer",["AddressModel",function DExOfferFactory(AddressModel){
		var DExOffer= function(data){
			var self = this;

			self.initialize = function(){
				data = data || {};

				if(data.offerId){// Load from server

				} else{ // Load from data
					self.amounts = data.amounts || {property:0,pair:0};
					self.address = data.address || null;
				}
			};


			self.initialize();
		}

		return DExOffer;
	}]);
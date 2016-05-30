angular.module("omniFactories")
	.factory("DExOffer",["Address",function DExOfferFactory(Address){
		var DExOffer= function(data){
			var self = this;

			self.initialize = function(){
				data = data || {};

				angular.extend(self,data);

				self.price = (new Big(data.amountforsale)).div(new Big(data.amountdesired));


			};


			self.initialize();
		}

		return DExOffer;
	}]);
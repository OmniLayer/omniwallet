angular.module("omniFactories")
	.factory("DExOffer",["Address", ,function DExOfferFactory(Address){
		var DExOffer= function(data,propertydesired,propertyselling){
			var self = this;

			self.initialize = function(){
				data = data || {};

				self.rawdata = data;
				self.propertyselling = propertyselling;
				self.propertydesired = propertydesired;
				self.available_amount = propertyselling.divisible ? new Big(data.available_amount).times(WHOLE_UNIT) : new Big(data.available_amount);
				self.selling_amount = propertyselling.divisible ? new Big(data.total_amount).times(WHOLE_UNIT) : new Big(data.total_amount);
				self.desired_amount = propertydesired.divisible ? new Big(data.desired_amount).times(WHOLE_UNIT) : new Big(data.desired_amount);
				self.price = self.desired_amount.div(self.selling_amount);


			};


			self.initialize();
		}

		return DExOffer;
	}]);
angular.module("omniFactories")
	.factory("DExOffer",["Address", "WHOLE_UNIT",function DExOfferFactory(Address, WHOLE_UNIT){
		var DExOffer= function(data,propertydesired,propertyselling,side){
			var self = this;

			self.initialize = function(){
				data = data || {};

				self.rawdata = data;
				self.propertyselling = propertyselling;
				self.propertydesired = propertydesired;
				self.available_amount = propertyselling.divisible ? new Big(data.available_amount).times(WHOLE_UNIT) : new Big(data.available_amount);
				self.selling_amount = propertyselling.divisible ? new Big(data.total_amount).times(WHOLE_UNIT) : new Big(data.total_amount);
				self.total_desired_amount = propertydesired.divisible ? new Big(data.desired_amount).times(WHOLE_UNIT) : new Big(data.desired_amount);
				self.desired_amount = self.total_desired_amount;
				if(side == "ask"){
					self.price = self.desired_amount.div(self.available_amount);
				} else if (side == "bid"){
					local_price = new Big(data.unit_price);
					self.desired_amount = new Big(self.available_amount).times(local_price);
					self.price = self.available_amount.div(self.desired_amount);
				} else if(side = "market"){
					self.price = new Big(data.unit_price);
				}
				self.time = Date.parse(data.time);
				self.status = data.status;

			};


			self.initialize();
		}

		return DExOffer;
	}]);

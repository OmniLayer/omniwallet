angular.module("omniFactories")
	.factory("DExOffer",["Address", "WHOLE_UNIT",function DExOfferFactory(Address, WHOLE_UNIT){
		var DExOffer= function(data,propertydesired,propertyselling,side){
			var self = this;

			self.initialize = function(){
				data = data || {};

				self.rawdata = data;
				self.propertyselling = propertyselling;
				self.propertydesired = propertydesired;
				self.txhash = data.txhash;
				local_price = new Big(data.unit_price);
				//original amount selling
				self.selling_amount = propertyselling.divisible ? new Big(data.total_amount).times(WHOLE_UNIT) : new Big(data.total_amount);
				//amount remaining selling
				self.available_amount = propertyselling.divisible ? new Big(data.available_amount).times(WHOLE_UNIT) : new Big(data.available_amount);
				//original amount desired
				self.total_desired_amount = propertydesired.divisible ? new Big(data.desired_amount).times(WHOLE_UNIT) : new Big(data.desired_amount);
				//amount desired to fill
				desired_amount = new Big(Math.ceil(self.available_amount.times(local_price).div(WHOLE_UNIT).toString())).times(WHOLE_UNIT);
				self.desired_amount = propertydesired.divisible ? desired_amount : new Big(parseInt(desired_amount));

				//protect against price drift when no matches have been made yet
				if (self.desired_amount.gt(self.total_desired_amount)) {
					self.desired_amount = self.total_desired_amount;
				}

				if(side == "ask"){
					//self.price = new Big(Math.ceil(self.desired_amount.div(self.available_amount).div(WHOLE_UNIT).toString())).times(WHOLE_UNIT);
					self.price = new Big(Math.round(self.desired_amount.div(self.available_amount).div(WHOLE_UNIT).toString())).times(WHOLE_UNIT);
				} else if (side == "bid"){
					//self.price = new Big(Math.floor(self.available_amount.div(self.desired_amount).div(WHOLE_UNIT).toString())).times(WHOLE_UNIT);
					self.price = new Big(Math.round(self.available_amount.div(self.desired_amount).div(WHOLE_UNIT).toString())).times(WHOLE_UNIT);
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

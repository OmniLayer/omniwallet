angular.module("omniFactories")
	.factory("DExOrder",["WHOLE_UNIT",function DExOrderFactory(WHOLE_UNIT){
		var DExOrder= function(offer){
			var self = this;

			self.initialize = function(){
				self.offers = [offer];
				self.price = new Big(offer.unit_price);

				self.totalforsale = (new Big(offer.total_amount)).times(WHOLE_UNIT);
				self.totaldesired = (new Big(offer.desired_amount)).times(WHOLE_UNIT);

				self.remainingforsale = (new Big(offer.available_amount)).times(WHOLE_UNIT);
				self.desiredreceived = (new Big(offer.accepted_amount)).times(WHOLE_UNIT);
			};

			self.addOffer = function(offer){
				
				if(!offer.price.eq(self.price))
					throw "offers must have the same price";

				self.offers.push(offer);

				self.totaldesired = self.totaldesired.plus((new Big(offer.desired_amount)).times(WHOLE_UNIT));
				self.totalforsale = self.totalforsale.plus((new Big(offer.total_amount)).times(WHOLE_UNIT));

				self.remainingforsale = self.remainingforsale.plus((new Big(offer.available_amount)).times(WHOLE_UNIT));
				self.desiredreceived = self.desiredreceived.plus((new Big(offer.accepted_amount)).times(WHOLE_UNIT));
			};


			self.initialize();
		}

		return DExOrder;
	}]);
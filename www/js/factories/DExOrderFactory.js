angular.module("omniFactories")
	.factory("DExOrder",["WHOLE_UNIT",function DExOrderFactory(WHOLE_UNIT){
		var DExOrder= function(offer){
			var self = this;

			self.initialize = function(){
				self.offers = [offer];
				self.price = offer.price;

				self.totalforsale = offer.selling_amount;
				self.totaldesired = offer.desired_amount;

				self.remainingforsale = offer.available_amount;
				self.hasPending = offer.status == 'pending';
				//self.desiredreceived = offer.accepted_amount; /* Accepted amount is not in db */
			};

			self.addOffer = function(offer){
				
				if(!offer.price.eq(self.price))
					throw "offers must have the same price";

				self.offers.push(offer);

				self.totaldesired = self.totaldesired.plus(offer.desired_amount);
				self.totalforsale = self.totalforsale.plus(offer.selling_amount);

				self.remainingforsale = self.remainingforsale.plus(offer.available_amount);
				self.hasPending = false;
				self.offers.forEach(function(myoffer){
					if(myoffer.status == 'pending'){
						self.hasPending = true;
					}
				})
				//self.desiredreceived = self.desiredreceived.plus(offer.accepted_amount);
			};

			self.initialize();
		}

		return DExOrder;
	}]);
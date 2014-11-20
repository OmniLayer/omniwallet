angular.module("omniFactories")
	.factory("DExOrder",["Address",function DExOrderFactory(Address){
		var DExOrder= function(offer){
			var self = this;

			self.initialize = function(){
				self.offers = [offer];
				self.price = (new Big(offer.amountforsale)).div(new Big(offer.amountdesired));

				self.totalforsale = offer.amountforsale;
				self.totaldesired = offer.amountdesired;

				self.remainigforsale = offer.remainingforsale;
				self.remainingdesired = offer.remainingdesired;
			};

			self.addOffer = function(offer){
				
				if(!offer.price.eq(self.price))
					throw "offers must have the same price";

				self.offers.push(offer);

				self.totaldesired += offer.amountdesired;
				self.totalforsale += offer.amountforsale;

				self.remainigforsale += offer.remainingforsale;
				self.remainingdesired += offer.remainingdesired;
			};


			self.initialize();
		}

		return DExOrder;
	}]);
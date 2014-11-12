angular.module("omniFactories")
	.factory("Orderbook",[function OrderbookFactory(){
		var Orderbook = function(transactionManager,tradingPair){
			var self = this;

			self.initialize = function(){
				self.transactionManager=transactionManager;
				self.tradingPair=tradingPair;
			}
		}

		return Orderbook;
	}]);
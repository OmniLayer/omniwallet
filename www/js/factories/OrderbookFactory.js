angular.module("omniFactories")
	.factory("Orderbook",[function OrderbookFactory(){
		var Orderbook = function(transactionManager,tradingPair){
			var self = this;

			self.initialize = function(){
				self.transactionManager=transactionManager;
				self.tradingPair=tradingPair;
				self.title = "Trade #" + tradingPair.property + " for " + tradingPair.pair == 1 ? "Mastercoin": "Test Mastercoin"
				self.active = true;
				self.disabled = !self.active;
			}

			self.initialize();
		}

		return Orderbook;
	}]);
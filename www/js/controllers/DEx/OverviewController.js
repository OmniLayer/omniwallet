angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","userService","Orderbook","TransactionManager",
		function DExOverviewController($scope,userService,Orderbook,TransactionManager){
			$scope.isLoggedIn = userService.loggedIn();
			$scope.orderbooks = [];

			var DExSaleTransaction = new TransactionManager(21);

			$scope.switchOrderbook = function(propertyId){
				$scope.orderbooks.forEach(function(orderbook){
					if(orderbook.tradingPair.property == propertyId)
						return orderbook.active = true;
				});
				var tradingPair = {property:propertyId,pair: propertyId < 2147483651 ? 1 : 2};
				var orderbook = new Orderbook(DExSaleTransaction, tradingPair)
				$scope.orderbooks.push(orderbook);
			}
	}]);
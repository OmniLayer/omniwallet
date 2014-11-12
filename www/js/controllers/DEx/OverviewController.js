angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","userService","Orderbook","TransactionManager",
		function DExOverviewController($scope,userService,Orderbook,TransactionManager){
			$scope.isLoggedIn = userService.loggedIn();
			$scope.orderbooks = [];

			var DExSaleTransaction = new TransactionManager(21);

			$scope.switchOrderbook = function(propertyId){
				var active = null;
				var selected = null;
				$scope.orderbooks.forEach(function(orderbook){
					if(orderbook.tradingPair.property == propertyId)
						selected = orderbook;
					if(orderbook.active)
						active=orderbook;
				});
				if(selected==null){
					var tradingPair = {property:propertyId,pair: propertyId < 2147483651 ? 1 : 2};
					selected = new Orderbook(DExSaleTransaction, tradingPair)
					$scope.orderbooks.push(selected);
				}
				if (active && active!= selected)
					active.active=false;
			}
	}]);
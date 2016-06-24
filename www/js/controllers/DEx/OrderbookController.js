angular.module("omniControllers")
	.controller("DExOrderbookController", ["$scope","Account","Orderbook","Wallet","PropertyManager","$http","$route",
		function DExOrderbookController($scope,Account,Orderbook,Wallet,PropertyManager,$http,$route){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbook = [];
			$scope.noOrders = true;
			PropertyManager.getProperty($route.current.params.propertyIdDesired).then(function(result){
				$scope.propertyDesired = result.data;
				PropertyManager.getProperty($route.current.params.propertyIdSelling).then(function(result){
					$scope.propertySelling = result.data;
					$scope.orderbook = new Orderbook({desired:$scope.propertyDesired,selling:$propertySelling});
				});
			});
	}]);
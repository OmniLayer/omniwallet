angular.module("omniControllers")
	.controller("DExOrderbookController", ["$scope","Account","Orderbook","Wallet","PropertyManager","$http","propertyiddesired","propertyidselling","ecosystem",
		function DExOrderbookController($scope,Account,Orderbook,Wallet,PropertyManager,$http,propertyiddesired,propertyidselling,ecosystem){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbook = [];
			$scope.noOrders = true;
			$scope.ecosystem = ecosystem;
			PropertyManager.getProperty(propertyiddesired).then(function(result){
				$scope.propertyDesired = result.data;
				PropertyManager.getProperty(propertyidselling).then(function(result){
					$scope.propertySelling = result.data;
					$scope.orderbook = new Orderbook({desired:$scope.propertyDesired,selling:$propertySelling});
				});
			});
	}]);
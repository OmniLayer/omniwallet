angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager",
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
			};

	}]);
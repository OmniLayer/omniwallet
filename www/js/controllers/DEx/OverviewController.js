angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager","$http"
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager,$http){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
			};

			$http.post('/v1/markets/designatingcurrencies',{ecosystem:$scope.ecosystem}).success(
				function(response) {
					$scope.designatingcurrencies = response.data.currencies;
				}
			);


	}]);
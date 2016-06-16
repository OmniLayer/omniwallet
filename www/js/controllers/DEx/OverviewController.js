angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager","$http",
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager,$http){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
				$scope.loadDesignatingCurrencies()
			};

			$scope.loadDesignatingCurrencies = function(){
				$http.post('/v1/markets/designatingcurrencies',{ecosystem:$scope.ecosystem}).then(function success(response) {$scope.designatingcurrencies = response.data.currencies;}, function(error){console.log(error)});
			}

			$scope.showMarkets = function(currency){
				console.log("display markets for " + currency.propertyid);
			}
	}]);
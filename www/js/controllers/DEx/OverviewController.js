angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","$http",
		function DExOverviewController($scope,Account,$http){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
				$scope.loadDesignatingCurrencies()
			};

			$scope.loadDesignatingCurrencies = function(){
				$http.post('/v1/markets/designatingcurrencies',{ecosystem:$scope.ecosystem}).then(
					function success(response) {
						$scope.designatingcurrencies = response.data.currencies;
						$scope.showMarkets(response.data.currencies[0])
					}, 
					function(error){
						console.log(error)
					}
				);
			}

			$scope.showMarkets = function(currency){
				$scope.designatingCurrency = currency;
				$http.get('/v1/markets/'+ currency.propertyid).then(
					function success(response) {
						$scope.markets = response.data.markets;
						$scope.noMarkets = $scope.markets.length == 0;
					}, 
					function(error){
						console.log(error)
					}
				);
			}
	}]);
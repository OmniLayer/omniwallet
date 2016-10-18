angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","$http","WHOLE_UNIT",
		function DExOverviewController($scope,Account,$http,WHOLE_UNIT){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
				$scope.loadDesignatingCurrencies()
			};

			$scope.loadDesignatingCurrencies = function(){
				$http.post('/v1/omnidex/designatingcurrencies',{ecosystem:$scope.ecosystem}).then(
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
				$http.get('/v1/omnidex/'+ currency.propertyid).then(
					function success(response) {
						var markets = response.data.markets;
						markets.forEach(function(market){
							if ([2,66,130].includes(market.propertytype)) {
								market.supply=market.supply*WHOLE_UNIT;
							}
							market.symbol =
								market.propertyid == 31 ? "USDT" :
								market.propertyid == 39 ? "AMP" :
								market.propertyname.substr(0,4).toUpperCase();
						});
						$scope.markets = response.data.markets;
						$scope.noMarkets = $scope.markets.length == 0;
						var topmarket = $scope.markets[0]
						if(topmarket){
							$scope.$parent.loadOrderbook(currency.propertyid,topmarket.propertyid)
						}
					}, 
					function(error){
						console.log(error)
					}
				);
			}
	}]);

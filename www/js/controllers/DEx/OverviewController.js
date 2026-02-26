angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","$http","WHOLE_UNIT",
		function DExOverviewController($scope,Account,$http,WHOLE_UNIT){
			$scope.isLoggedIn = Account.loggedIn;
			$scope.markets = [];
			$scope.noMarkets = true;
			$scope.filterMarkets = true;
			filteredMarkets = []
			$scope.ecosystem = 1;
			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
				$scope.loadDesignatingCurrencies()
			};

			$scope.showAll = function(){
				$scope.filterMarkets = !$scope.filterMarkets;
				$scope.loadDesignatingCurrencies();
			}

			$scope.loadDesignatingCurrencies = function(){
				$http.post('/v1/omnidex/designatingcurrencies',{ecosystem:$scope.ecosystem, filter:$scope.filterMarkets}).then(
					function success(response) {
						$scope.designatingcurrencies = response.data.currencies;
						filteredMarkets=response.data.filter;
						$scope.showMarkets(response.data.currencies[0])
					}, 
					function(error){
						console.log(error)
					}
				);
			}

			$scope.invert = function(currentSelling,currentDesired){
				var run=true;
				angular.forEach($scope.designatingcurrencies, function (value,key){
					if (run) {
						if (value.propertyid == currentSelling) {
							//Found what we want, break loop
							run=false;
							newSelling=value;
							$scope.showMarkets({'newCurrency':newSelling, 'newTopMarket':currentDesired});
						}
					}
				});
			}

			$scope.showMarkets = function(currency){
				var ltm=true;
				if (typeof(currency['newCurrency'])!='undefined') {
					tmid=currency['newTopMarket'];
					currency=currency['newCurrency'];
					ltm=false;
				}
				$scope.designatingCurrency = currency;
				$http.get('/v1/omnidex/'+ currency.propertyid).then(
					function success(response) {
						if ($scope.filterMarkets) {
                                                        //filter designated currencies list
							var markets = response.data.markets.filter(function (el) {
								return filteredMarkets.indexOf(el.propertyid) < 0;
							});
						} else {
							var markets = response.data.markets;
						}
						markets.forEach(function(market){
							if ([2,66,130].includes(market.propertytype)) {
								market.supply=market.supply*WHOLE_UNIT;
							}
							market.symbol =
								market.propertyid == 31 ? "USDT" :
								market.propertyid == 39 ? "AMP" :
								market.propertyname.substr(0,4).toUpperCase();
							market.price =
								new Big(market.askprice) == 0 ? market.bidprice : market.askprice ;
						});
						$scope.markets = markets;
						$scope.noMarkets = $scope.markets.length == 0;
						var topmarket = $scope.markets[0]
						if(topmarket && ltm){
							$scope.$parent.loadOrderbook(currency.propertyid,topmarket.propertyid)
						}
						if(!ltm){
							$scope.$parent.loadOrderbook(currency.propertyid,tmid)
						}
					}, 
					function(error){
						console.log(error)
					}
				);
			}
	}]);

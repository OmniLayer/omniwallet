angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager",
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbooks = [];
			$scope.availableTokens = [];
			$scope.tradingTokens = [];

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
					selected = new Orderbook(tradingPair)
					$scope.orderbooks.push(selected);
					$scope.tradingTokens.tradingTokens(propertyId)
				} else {
					selected.active = true;
				}
				if (active && active!= selected)
					active.active=false;
			}

			$scope.setEcosystem = function(){
			    PropertyManager.list($scope.ecosystem).then(function(result){
			      var availableTokens = result.data.properties.sort(function(a, b) {
			          var currencyA = a.propertyName.toUpperCase();
			          var currencyB = b.propertyName.toUpperCase();
			          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : (a.currencyId < b.currencyId) ? -1 : (a.currencyId > b.currencyId) ? 1 : 0 ;
			      });
			      $scope.availableTokens = availableTokens.filter(function(currency){
			        return $scope.tradingTokens.indexOf(currency.currencyId) == -1;
			      });
			    });
			};

			$scope.formatCurrencyDisplay = function(currencyDesired){
			    return currencyDesired.propertyName + " (" + currencyDesired.currencyId + ")";
			};
			
			$scope.updateAmounts = function(order,price){
				order.amounts.pair = order.amounts.property * price;
			};
	}]);
angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager",
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbooks = [];
			$scope.availableTokens = [];
			$scope.tradingTokens = [];

			$scope.switchOrderbook = function(property){
				var active = null;
				var selected = null;
				$scope.orderbooks.forEach(function(orderbook){
					if(orderbook.tradingPair.property == property.currencyId)
						selected = orderbook;
					if(orderbook.active)
						active=orderbook;
				});
				if(selected==null){
					var tradingPair = {property:property,pair: property.currencyId < 2147483651 ? 1 : 2};
					selected = new Orderbook(tradingPair)
					$scope.orderbooks.push(selected);
					$scope.tradingTokens.push(property.currencyId);
				} else {
					selected.active = true;
				}
				if (active && active!= selected)
					active.active=false;
			}

			$scope.setEcosystem = function(){
			    PropertyManager.listProperties($scope.ecosystem).then(function(result){
			      var availableTokens = result.data.properties.sort(function(a, b) {
			          var currencyA = a.propertyName.toUpperCase();
			          var currencyB = b.propertyName.toUpperCase();
			          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : (a.currencyId < b.currencyId) ? -1 : (a.currencyId > b.currencyId) ? 1 : 0 ;
			      });
			      $scope.availableTokens = availableTokens.filter(function(currency){
			        return $scope.tradingTokens.indexOf(currency.currencyId) == -1;
			      });
			      $scope.property=$scope.availableTokens[0];
			    });
			};

			$scope.formatCurrencyDisplay = function(currencyDesired){
			    return currencyDesired.propertyName + " (" + currencyDesired.currencyId + ")";
			};
			
			$scope.updateAmounts = function(order,price){
				order.amounts.pair = order.amounts.property * price;
			};
	}]);
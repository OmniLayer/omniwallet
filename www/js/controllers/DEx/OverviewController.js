angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","Wallet","PropertyManager",
		function DExOverviewController($scope,Account,Orderbook,Wallet,PropertyManager){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.markets = [];

			$scope.setEcosystem = function(ecosystem){
				$scope.ecosystem = ecosystem;
			    PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
			      var availableTokens = result.data.properties.sort(function(a, b) {
			          var currencyA = a.name.toUpperCase();
			          var currencyB = b.name.toUpperCase();
			          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : (a.propertyid < b.propertyid) ? -1 : (a.propertyid > b.propertyid) ? 1 : 0 ;
			      });
			      $scope.availableTokens = availableTokens.filter(function(currency){
			        return $scope.tradingTokens.indexOf(currency.propertyid) == -1;
			      });
			      $scope.property=$scope.availableTokens[0];
			    });
			};

	}]);
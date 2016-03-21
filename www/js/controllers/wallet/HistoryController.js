angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$q", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $q, $http, hashExplorer, $translate) {
		    $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
  			$scope.showtesteco = $scope.account.getSetting('showtesteco');
  			$scope.history = $scope.wallet.transactions($scope.showtesteco);		


		    $scope.changeAddress=function(address){
			  	if(address){
			  		$scope.selectedAddress = address;
			  		$scope.history = address.transactions.filter(function(tx){
				        return ((tx.currency.propertyid < 2147483648 && tx.currency.propertyid != 2) || $scope.showtesteco === 'true'); 
				    });
			  	} else {
			  		$scope.selectedAddress = undefined;
			  		$scope.history = $scope.wallet.transactions($scope.showtesteco);
			  	
			  	}
		    }
		}])
angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$location", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $location, $http, hashExplorer, $translate) {
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

		    $scope.setHashExplorer=function(transaction){
		    	$http.get('/v1/transaction/tx/' + transaction + '.json'). success(function(data) {
			      hashExplorer.setHash(data[0]);
			      $location.url('/explorer/inspector?view='+transaction)
			    });
		    }
		}])
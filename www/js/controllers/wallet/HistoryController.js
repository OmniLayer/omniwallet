angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$q", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $q, $http, hashExplorer, $translate) {
		    $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
  			var showtesteco = $scope.account.getSetting('showtesteco');
  			$scope.history = $scope.wallet.transactions(showtesteco);		


		    $scope.changeAddress=function(address){
			  	if(address){
			  		$scope.selectedAddress = address;
			  		$scope.history = address.transactions;
			  	} else {
			  		$scope.selectedAddress = undefined;
			  		$scope.history = $scope.wallet.transactions();
			  	
			  	}
		    }
		}])
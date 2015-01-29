angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$q", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $q, $http, hashExplorer) {
		  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);

		  $scope.changeAddress=function(address){
		  	if(address){
		  		$scope.selectedAddress = address;
		  		$scope.history = address.transactions;
		  	} else {
		  		$translate('WALLET_HISTORY_ALLADDRESSES').then(function(){
			  		$scope.selectedAddress = {hash:translation.WALLET_HISTORY_ALLADDRESSES}
			  		$scope.history = $scope.wallet.transactions();
		  		});
		  	}
		  }
		}])
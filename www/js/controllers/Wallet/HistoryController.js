angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$q", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $q, $http, hashExplorer, $translate) {
		    $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
		    var alladdresses = {hash:""};

		    $translate('WALLET_HISTORY_ALLADDRESSES').then(function(translation){
		  		alladdresses={hash:translation.WALLET_HISTORY_ALLADDRESSES};
		  		$scope.selectedAddress = alladdresses;
	  		});


  			$scope.history = $scope.wallet.transactions();		


		    $scope.changeAddress=function(address){
			  	if(address){
			  		$scope.selectedAddress = address;
			  		$scope.history = address.transactions;
			  	} else {
			  		$scope.selectedAddress = alladdresses
			  		$scope.history = $scope.wallet.transactions();
			  	
			  	}
		    }
		}])
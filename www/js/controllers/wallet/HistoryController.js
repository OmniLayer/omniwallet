angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$location", "$http", "hashExplorer", "$translate",
		function WalletHistoryController($scope, $location, $http, hashExplorer, $translate) {
  			$scope.showtesteco = $scope.account.getSetting('showtesteco');
			$scope.history=[]
			$scope.isLoading=true;
			$scope.wallet.transactions($scope.showtesteco).forEach(function(adrtx, index, array){
				adrtx.then(function(txs){
					//console.log(txs);
					txs.forEach(function(tx){
						$scope.history.push(tx);
					});
					if ( index == array.length-1 ) {
						$scope.isLoading=false;
					}
				});
			});


		    $scope.changeAddress=function(address){
			  	if(address){
					//address=address.updateTransactions();
					$scope.selectedAddress = address;
					$scope.history = [];
					$scope.isLoading=true;
					address.transactions($scope.showtesteco).then(function(txs){
						txs.forEach(function(tx){
							$scope.history.push(tx);
						});
						$scope.isLoading=false;
					});
			  	} else {
			  		$scope.selectedAddress = undefined;
					$scope.history=[]
					$scope.isLoading=true;
					$scope.wallet.transactions($scope.showtesteco).forEach(function(adrtx, index, array){
						adrtx.then(function(txs){
							//console.log(txs);
							txs.forEach(function(tx){
								$scope.history.push(tx);
							});
							if ( index == array.length-1 ) {
								$scope.isLoading=false;
							}
						});
					});			  	
			  	}
		    }

		    $scope.setHashExplorer=function(transaction){
		    	$http.get('/v1/transaction/tx/' + transaction + '.json'). success(function(data) {
			      hashExplorer.setHash(data[0]);
			      $location.url('/explorer/inspector?view='+transaction)
			    });
		    }
		}])

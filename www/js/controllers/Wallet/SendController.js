angular.module("omniControllers")
	.controller("WalletSendController",["$scope", function WalletSendController($scope){
		$scope.selectedAsset = $scope.wallet.getAsset(1) || $scope.wallet.getAsset(0);
		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];

      	$scope.showtesteco = $scope.account.getSetting('showtesteco');

      	$scope.setAsset = function(asset){
      		$scope.selectedAsset = asset;
      		$scope.selectedAddress = $scope.selectedAsset.tradeableAddresses[0];
      	}
	}])
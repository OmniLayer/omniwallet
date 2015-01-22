angular.module("omniControllers")
	.controller("WalletSendController",["$scope", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST", function WalletSendController($scope, MIN_MINER_FEE, PROTOCOL_FEE){
		$scope.minersFee = MIN_MINER_FEE;
		$scope.protocolFee = PROTOCOL_FEE;

		$scope.selectedAsset = $scope.wallet.getAsset(1) || $scope.wallet.getAsset(0);
		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];

      	$scope.showtesteco = $scope.account.getSetting('showtesteco');

      	$scope.setAsset = function(asset){
      		$scope.selectedAsset = asset;
      		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
      	}
      	$scope.setAddress = function(address){
      		$scope.selectedAddress = address;
      	}
	}])
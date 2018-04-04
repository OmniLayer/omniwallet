angular.module("omniControllers")
	.controller("WalletAssetsController",["$scope", "$location", "PropertyManager", function WalletAssetsController($scope, $location, PropertyManager){
		$scope.assets = [];
		PropertyManager.listByOwner($scope.wallet.tradableAddresses().map(function(address){ return address.hash; })).then(function(result){
			$scope.assets=result.data.properties;
		});

		$scope.setMangaged = function(asset){
			$scope.wallet.setManagedAsset(asset.propertyid);
			$scope.wallet.setManagedAddress(asset.issuer);
			$location.path('/wallet/manage');
		}
	  
	}])

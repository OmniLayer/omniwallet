angular.module("omniControllers")
	.controller("WalletAssetsController",["$scope", "$location", "PropertyManager", function WalletAssetsController($scope, $location, PropertyManager){
		$scope.assets = [];
		$scope.manage = true;
		PropertyManager.listByOwner($scope.wallet.tradableAddresses().map(function(address){ return address.hash; })).then(function(result){
			$scope.assets=result.data.properties;
		});

		$scope.setManaged = function(asset){
                        if (!$scope.wallet.assetIDs.includes(asset.propertyid)) {
                          $scope.wallet.addAsset("SP"+asset.propertyid, 0, false, asset.issuer, asset.propertyid)
                        }
			$scope.wallet.setManagedAsset(asset.propertyid);
			$scope.wallet.setManagedType(asset.type_int);
			$scope.wallet.setManagedAddress(asset.issuer);
			$location.path('/wallet/manage');
		}
	  
	}])

angular.module("omniControllers")
	.controller("WalletAssetsController",["$scope", "PropertyManager", function WalletAssetsController($scope, PropertyManager){
	    $scope.assets = [];
	    PropertyManager.listByOwner($scope.wallet.tradableAddresses()).then(function(result){
	      $scope.assets=result.data.properties;
	    });
	  
	  
	}])
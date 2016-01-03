angular.module("omniControllers")
	.controller("WalletAssetsController",["$scope", "PropertyManager", function WalletAssetsController($scope, PropertyManager){
	    $scope.assets = [];
	    PropertyManager.listByOwner($scope.wallet.tradableAddresses().map(function(address){ return address.hash; })).then(function(result){
	      $scope.assets=result.data.properties;
	    });
	  
	  
	}])
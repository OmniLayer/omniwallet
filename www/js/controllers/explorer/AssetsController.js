angular.module("omniControllers")
	.controller("ExplorerAssetsController",["$scope", "PropertyManager", function ExplorerAssetsController($scope, PropertyManager){
	    $scope.assets = [];
	    $scope.ecosystem = 2;
	    PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
	      $scope.assets=result.data.properties;
	    });
	  
	  
	}])
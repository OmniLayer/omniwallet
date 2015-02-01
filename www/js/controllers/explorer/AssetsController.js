angular.module("omniControllers")
	.controller("ExplorerAssetsController",["$scope", "PropertyManager", function ExplorerAssetsController($scope, PropertyManager){
	    $scope.assets = [];
	    PropertyManager.list().then(function(result){
	      $scope.assets=result.data.properties;
	    });
	  
	  
	}])
angular.module("omniControllers")
	.controller("ExplorerCrowdsalesController",["$scope", "PropertyManager", function ExplorerCrowdsalesController($scope, PropertyManager){
	    $scope.crowdsales = [];
	    $scope.ecosystem = 2;
	    PropertyManager.listCrowdsales($scope.ecosystem).then(function(result){
	      $scope.crowdsales=result.data.properties;
	    });
	  
	  
	}])
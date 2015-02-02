angular.module("omniControllers")
	.controller("ExplorerCrowdsaleController",["$scope", "PropertyManager", function ExplorerCrowdsaleController($scope, PropertyManager){
	    $scope.crowdsales = [];
	    $scope.ecosystem = 2;
	    PropertyManager.listCrowdsales($scope.ecosystem).then(function(result){
	      $scope.crowdsales=result.data.properties;
	    });
	  
	  
	}])
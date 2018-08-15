angular.module("omniControllers")
	.controller("ExplorerAssetsController",["$scope", "PropertyManager", function ExplorerAssetsController($scope, PropertyManager){
		$scope.assets = [];
		$scope.manage = false;

		$scope.setEcosystem = function(ecosystem){
			$scope.ecosystem=ecosystem;
			PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
				$scope.assets=result.data.properties;
			});
		};
	  	$scope.setEcosystem(1);
	}])

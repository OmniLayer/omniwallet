angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","userService", function DExOverviewController($scope,userService){
		$scope.isLoggedIn = userService.loggedIn();
	}]);
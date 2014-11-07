angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","userService", function DExOverviewController($scope,$http,userService){
		$scope.isLoggedIn = userService.loggedIn();
                $http.get('/v1/exchange/orders').success(function(data) {
                  $scope.orders=data;
                });
	}]);

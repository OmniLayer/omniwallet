

function StatsCtrl($scope, $route, $routeParams, $http) {

  $http.get('/v1/system/stats.json', {}).success(function(data) {
    $scope.stats = data;
  });
}



function HiddenLoginController($scope, $modal, $location) {
  $scope.open = function() {
    $scope.uuid = $location.path().replace("/login/", "");

    $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function() {
          return $scope.uuid;
        }
      }
    });
  }
}

function FailedSaveLoginController($scope, $modal, $location) {
  $scope.open = function() {
    $scope.uuid = $location.path().replace("/loginfs/", "");

    $modal.open({
      templateUrl: '/partials/login_modal_fs.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function() {
          return $scope.uuid;
        }
      }
    });
  }
}


angular.module("omniControllers")
  .controller("NavigationController", ["$scope",
    function NavigationController($scope) {

      $scope.getNavData = function() {
        console.log('init 0');
      };
      
      $scope.logout = function() {
        $scope.account.logout();
        //$window.location.href = $location.protocol() + "://" + $location.host();
        //window.location.reload(false);
      };

      $scope.$on('$locationChangeSuccess', function($event, path, from) {
        if(/\/wallet$/.test(path)) {
          $scope.section='wallet';
          $scope.subsection='overview';
        }
      });
    }
    ])

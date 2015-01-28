angular.module("omniControllers")
  .controller("NavigationController", ["$scope",
    function NavigationController($scope) {

      $scope.getNavData = function() {
        console.log('init 0');
      };
/*
      $scope.openUUIDmodal = function() {
        if (!$scope.modalOpened) {
          $scope.modalOpened = true;
          var modalInstance = $modal.open({
          templateUrl: '/partials/wallet_uuid_modal.html',
          controller: WalletController
          });
          modalInstance.result.then(function(){},
          function(){
            $scope.modalOpened = false;
          });
        }
      };

      $scope.openNewUUIDmodal = function() {
        $modal.open({
          templateUrl: '/partials/wallet_new_modal.html',
          controller: WalletController
        });
      };
*/
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

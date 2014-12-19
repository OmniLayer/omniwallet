 angular.module("omniControllers")
  .controller("SiteController",["$scope", "$route", "$routeParams", "$modal", "$location", "browser", "Account", "Wallet",
    function SiteController($scope, $route, $routeParams, $modal, $location, browser, Account, Wallet) {

      $scope.$route = $route;
      $scope.$location = $location;
      $scope.browser = browser;
      $scope.account = Account;
      $scope.wallet = Wallet;

      /*$scope.$on('$locationChangeStart', function(event, next) {
        if (browser === 'chrome') {
          return;
        }

        event.preventDefault();

        $modal.open({
          backdrop: 'static',
          templateUrl: '/partials/browser_message_modal.html'
        });
      });*/

      $scope.templates = {
        'sidecar': '/partials/sidecar.html',
        'add_address': '/partials/add_address.html',
        'disclaimer': '/partials/disclaimer.html'
      };

      $scope.events = [];

      $scope.$on('$idleStart', function() {
        if (Account.loggedIn) {
          var originalTitle = document.title;

          $modal.open({
            backdrop: 'static',
            controller: function ($injector, $scope, $http, $location, $modalInstance, $interval, $idle) {
              $idle.unwatch();

              var idleEndTimeFormat = function (idleEndTime) {
                var info = [
                  (idleEndTime >= 60 ? parseInt(idleEndTime / 60) + ' minute' + (parseInt(idleEndTime / 60) > 1 ? 's' : '') : undefined),
                  (idleEndTime % 60 > 0  ? (idleEndTime % 60) + ' second' + (idleEndTime % 60 > 1 ? 's' : '') : undefined),
                ]

                var i = info.length;
                while (i--) {
                  if (!info[i]) {
                    info.splice(i, 1);
                  }
                }

                return info.length > 0 ? 'in ' + info.join(' and ') : 'now';
              };

              $scope.idleEndTime = $idle._options().warningDuration;
              $scope.idleEndTimeFormatted = idleEndTimeFormat($scope.idleEndTime);
              document.title = 'Omniwallet\u2122 - Session time out ' + $scope.idleEndTimeFormatted;

              $scope.cancel = function () {
                $modalInstance.dismiss('cancel');
              };
              
              var timer = $interval(function () {
                $scope.idleEndTime--;
                if ($scope.idleEndTime === 0) {
                  $interval.cancel(timer);
                  location = location.origin + '/login/' + Account.uuid
                }

                $scope.idleEndTimeFormatted = idleEndTimeFormat($scope.idleEndTime);
                document.title = 'Omniwallet\u2122 - Session time out ' + $scope.idleEndTimeFormatted;
              }, 1000);

              $modalInstance.result.then(
                function () {
                  document.title = originalTitle;
                  $idle.watch();
                  $interval.cancel(timer);
                },
                function () {
                  document.title = originalTitle;
                  $idle.watch();
                  $interval.cancel(timer);
                }
              );
            },
            templateUrl: '/partials/idle_warning_modal.html'
          });
        }
      });

      $scope.$on('$idleWarn', function(e, countdown) {
        console.log('Idle warn');
      });

      $scope.$on('$idleTimeout', function() {
        /*if (Account.isLoggedOn) {
          location = location.origin + '/login/' + Account.uuid
        }*/
      });

      $scope.$on('$idleEnd', function() {
        
      });

      $scope.$on('$keepalive', function() {
        
      });

    }])
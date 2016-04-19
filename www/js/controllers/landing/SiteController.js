 angular.module("omniControllers")
  .controller("SiteController",["$http", "$scope", "$rootScope", "$route", "$routeParams", "$modal", "$location", "browser", "Account", "Wallet", "ModalManager",
    function SiteController($http, $scope, $rootScope, $route, $routeParams, $modal, $location, browser, Account, Wallet, ModalManager) {

      $scope.$route = $route;
      $scope.$location = $location;
      $scope.browser = browser;
      $scope.account = Account;
      $scope.wallet = Wallet;
      $scope.modalManager = ModalManager;

      $http.get('/v1/system/commits', {}).success(function(data) {
        $scope.version = data.commits[0].commitshort;
      }).error(function(){
        $scope.version = "Info: Click";
      });

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
            templateUrl: '/views/modals/idle_warning.html'
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

      $scope.showNotify = false;
      $scope.showError = false;
      $scope.success = {};
      $scope.error = {};
      $rootScope.notify = function(options){
        $scope.success = {
          message : options.message,
          url : options.url
        }
        $scope.showNotify = true;
        setTimeout(function(){
          $scope.$apply(function(){
            $scope.showNotify = false;
          })
        }, 30000)
      }

      $rootScope.notifyError = function(options){
        $scope.error = {
          message : options.message
        }
        $scope.showError = true;
        setTimeout(function(){
          $scope.$apply(function(){
            $scope.showError = false;
          })
        }, 30000)
      }

    }])

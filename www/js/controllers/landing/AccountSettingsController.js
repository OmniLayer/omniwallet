angular.module("omniControllers")
  .controller("AccountSettingsController",["$modal", "$injector", "$scope", "$http", "Account",
    function AccountSettingsController($modal, $injector, $scope, $http, Account) {

      mywallet = Account.wallet;
      $scope.wallet = mywallet;
      $scope.uuid = mywallet['uuid'];

      $scope.email = Account.getSetting('email');

      $http.get('/v1/values/currencylist').success(function(data) {
        $scope.currencylist = data;    
      }).error(function(){
        $scope.currencylist = [{'value':'USD','label':'United States Dollar'}];
      });

      $scope.selectedCurrency = Account.getSetting("usercurrency")
      $scope.filterdexdust = Account.getSetting("filterdexdust")
      $scope.donate = Account.getSetting("donate")
      $scope.showtesteco = Account.getSetting("showtesteco")

      $scope.label=function (name, abv) {
         return name+" ("+abv+")";
      }

      $scope.save = function() {
          if ($scope.myForm.$error.email) {
            $scope.saved = false;
            $scope.error = true;   
          } else {
            mywallet['email'] = $scope.email;
            mywallet['settings'] = { 'usercurrency':$scope.selectedCurrency,
                                   'filterdexdust':$scope.filterdexdust, 
                                   'donate':$scope.donate, 
                                   'showtesteco':$scope.showtesteco };
            Account.wallet = mywallet;
            Account.saveSession();
            $scope.saved = true;
            $scope.error = false;
            Account.setCurrencySymbol($scope.selectedCurrency);
            var appraiser= $injector.get("appraiser");
            appraiser.updateValues();
          }
        };

      $scope.changePassword = function() {
        $scope.login = {
            uuid: Account.uuid,
            action: 'verify',
            title: 'Verify Current Password',
            button: 'Validate',
            disable: true //disable UUID field in template
          };
          var modalInstance = $modal.open({
            templateUrl: '/partials/login_modal.html',
            controller: LoginController,
            scope: $scope
          });
          modalInstance.result.then(function() {
              var newPasswordModal = $modal.open({
                templateUrl: '/partials/wallet_password_modal.html',
                controller: WalletPasswordController,
                scope: $scope
              });
              newPasswordModal.result.then(function() {
                $scope.saved = true;
                $scope.error = false;
              }, function() {
                $scope.saved = false;
                //Closing modal shouldn't generate an error
                //$scope.error = true;
              });
          });
      };
    }

])
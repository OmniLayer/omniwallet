angular.module("omniControllers")
  .controller("AccountSettingsController",["$modal", "$injector", "$scope", "$http", "Account",
    function AccountSettingsController($modal, $injector, $scope, $http, Account) {

      mywallet = Account.wallet;
      $scope.wallet = mywallet;
      $scope.uuid = mywallet['uuid'];
      $scope.error = false;
      $scope.mfaemail = false;
      $scope.unsaved = false;
      $scope.mfa = Account.mfa;

      if ((typeof Account.asq=="undefined") || (Account.asq==null)) {
        $scope.asqtype='text';
      } else {
         $scope.asqtype='password';
      }

      $scope.asq = Account.asq;

      $scope.hideShowQuestion = function(){
        if ($scope.asqtype == 'password')
          $scope.asqtype = 'text';
        else
          $scope.asqtype = 'password';
      };

      $scope.email = Account.getSetting('email');

      checkMFA = function(){
        $scope.emailonfile = Account.getSetting('email');
        if ($scope.email.length==0) {
          allowmfa=false;
        } else {
          allowmfa=true;
        }
        $scope.allowmfa=allowmfa;
      };

      self.checkMFA();

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
      };

      $scope.resetMSGS = function() {
        $scope.error=false;
        $scope.saved=false;
        $scope.unsaved = true;
      };

      $scope.save = function() {
          self.checkMFA();
          if ($scope.myForm.$error.email) {
            $scope.saved = false;
            $scope.error = true;
          } else if (Account.mfa && !self.allowmfa) {
            $scope.saved = false;
            $scope.mfaemail = true;
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
            $scope.mfaemail = false;
            $scope.unsaved = false;
            Account.setCurrencySymbol($scope.selectedCurrency);
            var appraiser= $injector.get("appraiser");
            appraiser.updateValues();
            self.checkMFA();
          }
        };

      $scope.changePassword = function() {
          $scope.login = {
            uuid: Account.uuid,
            displayMFA: Account.mfa,
            action: 'verify',
            title: 'Verify Current Password',
            button: 'Validate',
            bodyTemplate: "/views/modals/partials/login.html",
            footerTemplate: "/views/modals/partials/login_footer.html",
            disable: true //disable UUID field in template
          };
          var modalInstance = $modal.open({
            templateUrl: '/views/modals/base.html',
            controller: LoginController,
            scope: $scope,
            backdrop:'static'
          });
          modalInstance.result.then(function() {
              var newPasswordModal = $modal.open({
                templateUrl: '/views/modals/change_password.html',
                controller: WalletPasswordController,
                scope: $scope
              });
              newPasswordModal.result.then(function() {
                $scope.saved = true;
                $scope.error = false;
                $scope.mfaemail = false;
              }, function() {
                $scope.saved = false;
                //Closing modal shouldn't generate an error
                //$scope.error = true;
              });
          });
      };

      $scope.setupMFA = function() {
          $scope.login = {
            uuid: Account.uuid,
            displayMFA: Account.mfa,
            action: 'verify',
            title: 'Verify Current Password',
            button: 'Validate',
            bodyTemplate: "/views/modals/partials/login.html",
            footerTemplate: "/views/modals/partials/login_footer.html",
            disable: true //disable UUID field in template
          };
          var modalInstance = $modal.open({
            templateUrl: '/views/modals/base.html',
            controller: LoginController,
            scope: $scope,
            backdrop:'static'
          });

          //for accounts without mfa setup we preload the new mfa secret before trying to render it
          if (!Account.mfa) {
            $http.get('/v1/user/wallet/newmfa?uuid=' + Account.uuid)
            .success(function(data, status) {
              if (data.error) {
                $scope.getsecretError = true;
                $scope.secret="";
                $scope.prov="";
              } else {
                $scope.getsecretError = false;
                $scope.secret=data.secret;
                $scope.prov=data.prov;
                $scope.asq="";
              }
            }).error(function() {
              $scope.getsecretError = true;
              $scope.secret="";
              $scope.prov="";
            });
          } else {
            $scope.prov="<encrypted>";
          }

          modalInstance.result.then(function() {
              var MfaModal = $modal.open({
                templateUrl: '/views/modals/setup_mfa.html',
                controller: MFASetupController,
                scope: $scope
              });
              MfaModal.result.then(function() {
                $scope.saved = true;
                $scope.error = false;
                $scope.mfaemail = false;
                $scope.mfa=Account.mfa;
                $scope.asq=Account.asq;
                self.checkMFA();
              }, function() {
                $scope.saved = false;
              });
          });
      };

    }
])

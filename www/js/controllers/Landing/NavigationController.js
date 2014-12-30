angular.module("omniControllers")
  .controller("NavigationController", ["$scope", "$http", "$modal", "Account",
    function NavigationController($scope, $http, $modal, Account) {

      $scope.getNavData = function() {
        console.log('init 0');
      };
      
      $scope.openCreateModal = function() {
        if (!$scope.modalOpened) {
          $scope.modalOpened = true;
          var modalInstance = $modal.open({
          templateUrl: '/partials/wallet_create_modal.html',
          controller: CreateWalletController,
          backdrop:'static'
          });
          modalInstance.result.then(
          function(){
            // reset modal status when wallet created successfully
            $scope.modalOpened = false;
          },
          function(){
            $scope.modalOpened = false;
          });
        }
      };

      $scope.openImportModal = function() {
        $modal.open({
          templateUrl: '/partials/wallet_import_modal.html',
          controller: WalletController
        });
      };

      $scope.openLoginModal = function() {        
        $scope.login ={
          title:'Login',
          button:'Open Wallet'
        };
        if (!$scope.modalOpened) {
          $scope.modalOpened = true;
          var modalInstance = $modal.open({
          templateUrl: '/partials/login_modal.html',
          controller: LoginController,
          scope: $scope,
          backdrop:'static'
          });
          modalInstance.result.then(
          function(){
            // reset modal state when user logs in successfully
            $scope.modalOpened = false;
          },
          function(){
            $scope.modalOpened = false;
          });
        }
      };

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

      $scope.logout = function() {
        Account.logout();
        //$window.location.href = $location.protocol() + "://" + $location.host();
        //window.location.reload(false);
      };

      $scope.account = Account;

      $scope.$on('$locationChangeSuccess', function($event, path, from) {
        if(/\/wallet$/.test(path)) {
          $scope.section='wallet';
          $scope.subsection='overview';
        }
      });
    }
    ])

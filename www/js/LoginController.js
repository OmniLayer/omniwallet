function LoginControllerUUID($injector, $scope, $http, $location, $modalInstance, $q, Account, uuid) {
  $scope.login = {
    uuid: uuid
  }

  Login($injector, $scope, $http, $location, $modalInstance, $q, Account);
}

function LoginController($injector, $scope, $http, $location, $modalInstance, $q, Account) {
  Login($injector, $scope, $http, $location, $modalInstance, $q, Account);
}

// Helper (Not sure if this can be fixed with providers)
function Login($injector, $scope, $http, $location, $modalInstance, $q, Account) {
  $scope.dismiss = $modalInstance.dismiss;
  
  $scope.loginInProgress = false;
  $scope.login.title == undefined ? $scope.login.title = 'Login' : $scope.login.title;
  $scope.login.button == undefined ? $scope.login.button = 'Open Wallet' : $scope.login.button;
  
  $scope.open = function(login) {
    if ( Account.verifyUUID(login.uuid) == false ) {
      $scope.missingUUID = true;
      return 0;
    }

    $scope.loginInProgress = true;
    $scope.missingUUID = false;
    $scope.badPassword = false;
    $scope.serverError = false;

    Account.login(login.uuid,login.password).then(function(account){
      if( $scope.login != undefined && $scope.login.action == 'verify' ) {
        $modalInstance.close(account) //pass wallet as verification
      } else {
        $modalInstance.close()
        $location.path('/wallet');
      }
    },function(error){
      angular.extend($scope,error);
    })
        
  };
}
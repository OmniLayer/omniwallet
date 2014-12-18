function LoginControllerUUID($injector, $scope, $http, $location, $modalInstance, $q, Account, uuid, $idle) {
  $scope.login = {
    uuid: uuid
  }

  Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle);
}

function LoginController($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle) {
  Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle);
}

// Helper (Not sure if this can be fixed with providers)
function Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle) {
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

    if($scope.login.action == 'verify'){
      Account.verify(login.uuid,login.password).then(function(){
        $modalInstance.close(Account.wallet) //pass wallet as verification
        $idle.watch();
      },function(error){
        $scope.loginInProgress=false;
        angular.extend($scope,error);
      });
    } else {
      Account.login(login.uuid,login.password).then(function(wallet){
          $modalInstance.close()
          $location.path('/wallet');
          $idle.watch();
      },function(error){
	$scope.loginInProgress=false;
        angular.extend($scope,error);
      })
    }   
  };
}

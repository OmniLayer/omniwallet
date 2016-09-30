function LoginControllerUUID($injector, $scope, $http, $location, $modalInstance, $q, Account, uuid, $idle) {
  $scope.login = {
    uuid: uuid,
    password: ''
  };
  $scope.displayMFA = true;
  $scope.toggleMFA = true;
  $scope.login.mfachecked = false;

  Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle);
}

function LoginController($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle) {
  if ( $scope != undefined && $scope.login != undefined && $scope.login.action != undefined && $scope.login.action == 'verify' ) {
    console.log("sync 1");
    $scope.displayMFA = Account.mfa;
    $scope.login.mfachecked = Account.mfa;
    $scope.toggleMFA = false;
  } else {
    //console.log("sync 2");
    $scope.login = {
      uuid: '',
      password: ''
    }
    $scope.displayMFA = true;
    $scope.toggleMFA = true;
    $scope.login.mfachecked = false;
  }

  Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle);
}

// Helper (Not sure if this can be fixed with providers)
function Login($injector, $scope, $http, $location, $modalInstance, $q, Account, $idle) {
  $scope.dismiss = $modalInstance.dismiss;
  
  $scope.loginInProgress = false;
  $scope.login.title == undefined ? $scope.title = 'Login' : $scope.title = $scope.login.title;
  $scope.login.button == undefined ? $scope.button = 'Open Wallet' : $scope.button = $scope.login.button;
  $scope.login.bodyTemplate != undefined ? $scope.bodyTemplate = $scope.login.bodyTemplate : null;
  $scope.login.footerTemplate != undefined ? $scope.footerTemplate = $scope.login.footerTemplate : null;
  $scope.loginInvalid = true;

  $scope.checkLogin=function() {
    valid=true;
    if ( !Account.verifyUUID($scope.login.uuid) || $scope.login.password.length < 1 ) {
      valid=false;
    }
    if ($scope.login.mfachecked && $scope.login.mfatoken.length<6) {
      valid=false;
    }
    $scope.loginInvalid = !valid;
  }

  $scope.toggleMFAcheckbox=function() {
    if ($scope.toggleMFA) {
      $scope.login.mfachecked=!$scope.login.mfachecked;
    }
  }
  
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
      console.log("verifying");	
      Account.login(login.uuid,login.password,login.mfatoken).then(function(){
        console.log("verified");
        $modalInstance.close(Account.wallet) //pass wallet as verification
        $idle.watch();
      },function(error){
        console.log("not verified");
        $scope.loginInProgress=false;
        angular.extend($scope,error);
      });
    } else {

      Account.login(login.uuid,login.password,login.mfatoken).then(function(wallet){
          $modalInstance.close()
          $location.path('/wallet');
          $idle.watch();
      },function(error){
	$scope.loginInProgress=false;
        angular.extend($scope,error);
      })
    }   
  };

  $scope.close = function() {
    $modalInstance.dismiss('close');
  };

  $scope.keyPress = function($event){
    if($event.keyCode == 13) $scope.open($scope.login)
  }
}

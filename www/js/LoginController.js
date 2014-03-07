function LoginControllerUUID($scope, $http, $location, $modalInstance, userService, uuid) {
  $scope.login = {
    uuid: uuid
  }

  Login($scope, $http, $location, $modalInstance, userService);
}

function LoginController($scope, $http, $location, $modalInstance, userService) {
  Login($scope, $http, $location, $modalInstance, userService);
}

// Helper (Not sure if this can be fixed with providers)
function Login($scope, $http, $location, $modalInstance, userService) {
  $scope.open = function(login) {
    var postData = {
      type: 'RESTOREWALLET',
      uuid: login.uuid
    }
    $http({
        url: '/v1/user/wallet/restore/',
        method: 'POST',
        data: postData,
        headers: {'Content-Type': 'application/json'}
    })
    .success(function (data, status, headers, config) {
      console.log(data);
      if(data.status == "MISSING") {
        $scope.missingUUID = true;
      } else {
        var passwordHash = data.wallet.passwordHash;
        var salt = data.wallet.salt;
        var loginHash = Crypto.SHA256(login.password + salt);

        if(loginHash == passwordHash) {
          console.log(data.wallet);
          userService.login(data.wallet);
          $modalInstance.close();
          $location.path('/wallet');
        } else {
          $scope.badPassword = true;
        }
      }
    })
    .error(function(data, status, headers, config) {
      $scope.serverError = true;
    });
  }
}

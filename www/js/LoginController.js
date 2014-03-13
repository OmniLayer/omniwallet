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
    var uuid = login.uuid;
    var asymKey = {};
    var walletKey = '';

    $http.get('/v1/user/wallet/challenge?uuid='+uuid)
      .then(function(result) {
        var data = result.data;
        var nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
        walletKey = CryptUtil.generateSymmetricKey(login.password, data.salt);
        asymKey = CryptUtil.generateAsymmetricPair();
        encodedPub = window.btoa(asymKey.pubPem);

        return $http({
          url: '/v1/user/wallet/login',
          method: 'GET',
          params: { nonce: nonce, public_key: encodedPub, uuid: uuid }
        });
      })
      .then(function(result) {
        var data = result.data;
        var wallet = CryptUtil.decryptObject(data, walletKey);
        userService.login(wallet, walletKey, asymKey);
        $modalInstance.close()
        $location.path('/wallet');
      }, function(result) {
        $scope.serverError = true;
      });
  }
}

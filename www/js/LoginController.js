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
        try {
          var wallet = CryptUtil.decryptObject(data, walletKey);

          var addCurrencies = function(i) {
            if (i < wallet.addresses.length) {
              $http.post('/v1/address/addr/', {
                'addr' : wallet.addresses[i].address
              }).then(function(result) {
                var currencies = [];
                result.data.balance.map(function(e, i, a) {
                  currencies.push(e.symbol);
                });
                wallet.addresses[i].currencies = currencies;
                addCurrencies(i+1);
              }, function(error) {
                wallet.addresses[i].currencies = [];
                addCurrencies(i+1);
              });
            }
            else {
              userService.login(wallet, walletKey, asymKey);
              $modalInstance.close()
              $location.path('/wallet');
            };
          }
          addCurrencies(0);
        } catch (e) {
          $scope.badPassword = true;
        }
      },
      function(result) {
        if(result.status == 404) {
          $scope.missingUUID = true;
        } else {
          $scope.serverError = true;
        }
      });
  }
}

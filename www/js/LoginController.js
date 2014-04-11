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
          var walletMetadata ={ currencies : [] };
          
          var addCurrencies = function(i) {
            if (i < wallet.addresses.length) {
              $http.post('/v1/address/addr/', {
                'addr' : wallet.addresses[i].address
              }).then(function(result) {
                result.data.balance.forEach(function(balanceItem) {
                  var currency = null;
                  for( var j = 0; j<walletMetadata.currencies.length; j++ ) {
                    currencyItem = walletMetadata.currencies[j];
                    if(currencyItem.symbol == balanceItem.symbol) {
                      currency = currencyItem;
                      currency.addresses.push(wallet.addresses[i].address);
                      break;
                    }
                  }
                  if (currency == null){
                    currency = { symbol : balanceItem.symbol, addresses : [wallet.addresses[i].address]};
                    walletMetadata.currencies.push(currency);
                  }
                });
                addCurrencies(i+1);
              }, function(error) {
                addCurrencies(i+1);
              });
            }
            else {
              userService.login(wallet, walletKey, asymKey, walletMetadata);
              $modalInstance.close();
              $location.path('/wallet');
            };
          };
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
  };
}

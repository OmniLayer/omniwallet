function LoginControllerUUID( $injector, $scope, $http, $location, $modalInstance, $q, userService, uuid) {
  $scope.login = {
    uuid: uuid
  }

  Login( $injector, $scope, $http, $location, $modalInstance, $q, userService);
}

function LoginController( $injector, $scope, $http, $location, $modalInstance, $q, userService) {
  Login($injector, $scope, $http, $location, $modalInstance, $q, userService);
}

// Helper (Not sure if this can be fixed with providers)
function Login($injector, $scope, $http, $location, $modalInstance, $q, userService) {
  $scope.loginInProgress=false;

  $scope.open = function(login) {
    var uuid = login.uuid;
    var asymKey = {};
    var walletKey = '';
    var nonce = 0;
    $scope.loginInProgress=true;

    $http.get('/v1/user/wallet/challenge?uuid='+uuid)
      .then(function(result) {
        var data = result.data;
        var asyncCrypto = $q.defer();

        // daisy chain several async crypto calls into a promise
        CryptUtilAsync.generateNonceForDifficulty(data.pow_challenge, function(result) {
          nonce = result;
          CryptUtilAsync.generateSymmetricKey(login.password, data.salt, function(result){
            walletKey = result;
            CryptUtilAsync.generateAsymmetricPair(function(result){
              asymKey = result;
              encodedPub = window.btoa(asymKey.pubPem);
              $scope.$apply(function(){
                asyncCrypto.resolve();          
              });
            });
          });
        });
        
        return asyncCrypto.promise;
      })
      .then(function(result) {
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
              $injector.get( 'balanceService' ).balance( wallet.addresses[i].address )
              .then(function(result) {
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
        $scope.loginInProgress=false;
      });
  };
}

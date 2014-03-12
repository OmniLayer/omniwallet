function CreateWalletController($scope, $http, $location, $modalInstance, userService) {
  $scope.createWallet = function(create) {
    var uuid = generateUUID();
    var wallet = {
      uuid: uuid,
      addresses: []
    };

    $http.get('/flask/challenge?uuid='+uuid)
      .then(function(result) {
        var data = result.data;
        nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
        key = CryptUtil.generateSymmetricKey(create.password, data.salt);
        var encryptedWallet = CryptUtil.encryptObject(wallet, key);
        var public_key = ""
        console.log(encryptedWallet);

        return $http({
          url: '/flask/create',
          method: 'POST',
          data: { nonce: nonce, public_key: public_key, uuid: uuid, wallet: encryptedWallet }
        });
      }, function (result) {
        console.log('error getting salt');
      })
      .then(function(result) {
        userService.login(wallet);
        $modalInstance.close()
        $location.path('/wallet');
      }, function(result) {
        $scope.serverError = true;
      });
  }
}

function createWallet($scope, $http, $location, $modalInstance, userService, wallet) {
  // Strange serialization effects, stringifying wallet initially
  var postData = {
    type: 'CREATEWALLET',
    wallet: JSON.stringify(wallet)
  };
  $http({
    url: '/v1/user/wallet/sync/',
    method: 'POST',
    data: postData,
    headers: {'Content-Type': 'application/json'}
  })
  .success(function(data, status, headers, config) {
    if(data.status == "EXISTS") {
      console.log(data);
      $scope.walletExists = true;
    } else {
      userService.login(wallet);
      $modalInstance.close();
      $location.path("/wallet");
    }
  })
  .error(function(data, status, headers, config) {
    console.log("Error on login");
    $scope.serverError = true;
  });
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
};


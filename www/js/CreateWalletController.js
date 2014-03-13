function CreateWalletController($scope, $http, $location, $modalInstance, userService) {
  $scope.createWallet = function(create) {
    var uuid = generateUUID();
    var wallet = {
      uuid: uuid,
      addresses: []
    };
    var walletKey = ''
    var asymKey = {}

    $http.get('/v1/user/wallet/challenge?uuid='+uuid)
      .then(function(result) {
        var data = result.data;
        var nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
        walletKey = CryptUtil.generateSymmetricKey(create.password, data.salt);
        var encryptedWallet = CryptUtil.encryptObject(wallet, walletKey);
        asymKey = CryptUtil.generateAsymmetricPair();
        return $http({
          url: '/v1/user/wallet/create',
          method: 'POST',
          data: { nonce: nonce, public_key: asymKey.pubPem, uuid: uuid, wallet: encryptedWallet }
        });
      })
      .then(function(result) {
        userService.login(wallet, walletKey, asymKey);
        $modalInstance.close()
        $location.path('/wallet');
      }, function(result) {
        $scope.serverError = true;
      });
  }
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


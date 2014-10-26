function CreateWalletController($scope, $http, $location, $modalInstance, userService) {
  $scope.dismiss = $modalInstance.dismiss;
  
  $scope.createWallet = function(create) {
    var uuid = generateUUID();
    var wallet = {
      uuid: uuid,
      addresses: []
    };
    var walletKey = ''
    var asymKey = {}
    $scope.validating=true;
    $scope.serverError = $scope.invalidCaptcha =false;
    $http.get('/v1/user/wallet/challenge?uuid=' + uuid)
      .then(function(result) {
        var data = result.data;
        var nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
        walletKey = CryptUtil.generateSymmetricKey(create.password, data.salt);
        var encryptedWallet = CryptUtil.encryptObject(wallet, walletKey);
        asymKey = CryptUtil.generateAsymmetricPair();
        var createData = {
            email: create.email,
            nonce: nonce,
            public_key: asymKey.pubPem,
            uuid: uuid,
            wallet: encryptedWallet
          };

        if(create.captcha){
          angular.extend(createData, {
            recaptcha_challenge_field:create.captcha.challenge,
            recaptcha_response_field:create.captcha.response
          })
        };

        return $http({
          url: '/v1/user/wallet/create',
          method: 'POST',
          data: createData
        });
      })
      .then(function(result) {
        if(result.data.error =="InvalidCaptcha"){
          $scope.invalidCaptcha = true;
          $scope.validating=false;
          Recaptcha.reload();
        }else {
          $scope.validating=false;

          userService.login(wallet, walletKey, asymKey);
          ga('send', 'event', 'button', 'click', 'Create Wallet');
          $modalInstance.close()
          $location.path('/wallet/addresses');
        }
      }, function(result) {
        $scope.validating=false;
        $scope.serverError = true;
      });
  }
}

function generateUUID() {
  var d = new Date().getTime();
  var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
  return uuid;
}
;


function verifyUUID(uuid) {
  //Check UUID for proper format
  verify = uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89a-f][0-9a-f]{3}-[0-9a-f]{12}$/i) || []
  
  //Return false if it fails, true if its valid structure
  if (verify.length == 0) {
   return false;
  } else {
   return true;
  }
}
;

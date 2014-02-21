function LoginController($scope, $http, $location, userService) {

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
      if(data.status == "MISSING") {
        $scope.missingUUID = true;
      } else {
        var encrypted = data.wallet.keys[0].encrypted //Assumes we're decoding first key
        // TODO: Handle multiple addresses

        try {
          var key = new Bitcoin.ECKey.decodeEncryptedFormat(encrypted, login.password);
          var address = key.getBitcoinAddress().toString();
          var privateKey = Crypto.util.bytesToHex(key.getPrivateKeyByteArray());
          userService.login(login.uuid);
          userService.addAddress(address, privateKey);
          console.log("Success.");
          $location.path('/wallet');
        } catch (err) {
          console.log(err);
          console.log("Bad password");
          $scope.badPassword = true;
        }
      }
    })
    .error(function(data, status, headers, config) {
      console.log("ERROR");
      $scope.serverError = true;
    });
  }
}

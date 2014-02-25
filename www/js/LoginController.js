function LoginController($scope, $http, $location, $modalInstance, userService) {

  $scope.open = function(login) {
    var postData = {
      type: 'RESTOREWALLET',
      email: login.email
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
        $scope.missingEmail = true;
      } else {
        var encrypted = data.wallet.addresses[0].privkey //Assumes we're decoding first key
        // TODO: Handle default address

        try {
          var key = new Bitcoin.ECKey.decodeEncryptedFormat(encrypted, login.password);
          var address = key.getBitcoinAddress().toString();
          userService.login(data.wallet);
          $modalInstance.close();
          $location.path('/wallet');
        } catch (err) {
          console.log(err);
          $scope.badPassword = true;
        }
      }
    })
    .error(function(data, status, headers, config) {
      $scope.serverError = true;
    });
  }
}

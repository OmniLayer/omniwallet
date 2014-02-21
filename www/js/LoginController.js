function LoginController($scope, $http, userService) {

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
      if(data.status == "ERROR") {
        $scope.missingUUID = true;
      } else {
        console.log("SUCCESS");
        // Add Wallet Decryption here
        userService.data.loggedIn = true;
        userService.data.uuid = login.uuid;
        $scope.$emit('savestate');
      }
    })
    .error(function(data, status, headers, config) {
      console.log("ERROR");
      $scope.serverError = true;
    });
  }
}

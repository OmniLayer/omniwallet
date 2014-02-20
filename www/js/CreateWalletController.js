function CreateWalletController($scope, $http, userService) {
  $scope.createWallet = function(create) {
    console.log(create);

    if(create.password != create.repeatPassword) {
      console.log("Passwords don't match")
      $scope.passwordCompare = true;
    } else {
      var uuid = generateUUID();
      var password = create.password;

      //Generate new wallet here
      //Sync to server, if OK store in User Service
    }
  }
  //Check User Service before overwriting it with new UUID/Wallet info

  function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  };

}

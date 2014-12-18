function CreateWalletController($scope, $location, $modalInstance, $idle, Account, AddressManager) {
  $scope.dismiss = $modalInstance.dismiss;
  
  $scope.createWallet = function(create) {
    $scope.validating=true;
    $scope.serverError = $scope.invalidCaptcha =false;
    Account.create(create).then(function(account){
      var address = AddressManager.createAddress();
      account.addAddress(address.hash,address.privkey).then(function(result){
        $modalInstance.close()
        $location.path('/wallet');
        $idle.watch();
      });
    },function(error){
      angular.extend($scope,error);
    })
  }
}

function WalletPasswordController($scope, $location, $modalInstance, $http, Account) {
  $scope.dismiss = $modalInstance.dismiss;

  $scope.changePassword = function(change) {
    $scope.validating=true;
    $scope.serverError = false;

    $http.get('/v1/user/wallet/challenge?uuid=' + Account.uuid)
    .success(function(data, status) {
      Account.walletKey = CryptUtil.generateSymmetricKey(change.password, data.salt);
      Account.saveSession();
      $modalInstance.close()
    }).error(function() {
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

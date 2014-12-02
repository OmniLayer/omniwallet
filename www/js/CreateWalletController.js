function CreateWalletController($scope, $location, $modalInstance, Account, AddressManager) {
  $scope.dismiss = $modalInstance.dismiss;
  
  $scope.createWallet = function(create) {
    $scope.validating=true;
    $scope.serverError = $scope.invalidCaptcha =false;
    Account.create(create).then(function(account){
      var address = AddressManager.createAddress();
      account.addAddress(address.hash,address.privkey).then(function(result){
        $modalInstance.close()
        $location.path('/wallet');
      });
    },function(error){
      angular.extend($scope,error);
    })
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

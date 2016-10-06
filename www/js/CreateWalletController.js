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

function MFASetupController($scope, $location, $modalInstance, $http, Account) {
  $scope.dismiss = $modalInstance.dismiss;

  $scope.mfa = Account.mfa;
  if (Account.mfa) {
    $scope.asq=Account.asq;
    $scope.asa="valid";
  } else {
    $scope.mfadisable="no";
  }

  $scope.setupMFA = function(mfadisable,mfatoken,asq,asa) {
    $scope.validating=true;
    $scope.serverError = false;

    token=mfatoken;
    secret=$scope.secret;

    if (Account.mfa) {
      //mfa already setup, check if we're disabling
      if (mfadisable=='DISABLE') {
        action='del';
      } else {
        //throw error
        $scope.validating=false;
        $scope.serverError = true;
        return;
      }
    } else {
      action='add';
    }

    $http.get('/v1/user/wallet/challenge?uuid=' + Account.uuid)
    .success(function(data, status) {
      //Account.walletKey = CryptUtil.generateSymmetricKey(change.password, data.salt);
      Account.updateMFA(secret,token,action,asq,asa)
        .then(function(result) {
          if (result.data.updated) {
            console.log("Update Successful");
            $scope.mfa=Account.mfa=!Account.mfa;
            $modalInstance.close()
          } else {
            console.log("Update Failed");
            $scope.validating=false;
            $scope.serverError = true;
          }
          //console.log(result);
        });
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

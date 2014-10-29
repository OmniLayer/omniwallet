angular.module('omniwallet')
  .factory('enumerated_addresses', function($http, $q, $timeout, $injector) {
    var count = 1;
    return {
      "getData": function() {
        var deferred = $q.defer();

        _.defer(function() {
          var wallet = $injector.get('userService').getWallet();
          if (wallet && wallet.addresses.length > 0) {

            deferred.resolve({
              addresses: wallet.addresses
            });
          } else {
            deferred.resolve({
              addresses: []
            });
          }
        });
        return deferred.promise;
      }
    };
  })
  .controller('AddAddressController', function($modal, $injector, $scope, $timeout, userService, enumerated_addresses) {

  function decodeAddressFromPrivateKey(key) {

    //  Return the address decoded from the private key.
    var eckey = new Bitcoin.ECKey(key);
    var addr = eckey.getBitcoinAddress().toString();

    return addr;
  };

  function encodePrivateKey(key, passphrase) {

    //  Return encoded key.  Forget the passphrase forever.
    var eckey = new Bitcoin.ECKey(key);
    var enc = eckey.getEncryptedFormat(passphrase);

    return enc;
  };

  $scope.backupWallet = function() {
    $scope.login = {
      uuid: userService.data.wallet.uuid,
      action: 'verify',
      title: 'Verify Account',
      button: 'Validate',
      disable: true //disable UUID field in template
    };
    var modalInstance = $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginController,
      scope: $scope
    });

    modalInstance.result.then(function(wallet) {
      $scope.exportData = {
        backupName : wallet.uuid,
        exportPrivate : true,
        exportWatch : true
      };
      $scope.exportInProgress=false;
      var exportModalInstance = $modal.open({
        templateUrl: '/partials/export_wallet.html',
        controller: function($scope, $modalInstance, wallet){
          $scope.summary = [];
          $scope.exportFinished = false;
          $scope.exportWallet = function(exportData){
            $scope.exportInProgress=true;
            $scope.exported = 0;
            var walletAddresses = wallet.addresses;
            $scope.total = walletAddresses.length;
            var blob = {
              addresses: []
            };
            
            var next = function(){
              $timeout(function(){
                return exportAddress(walletAddresses[$scope.exported]);
              },0,false);
            };
            
            var exportAddress = function(obj){
              $scope.$apply(function(){
                if($scope.exported == $scope.total) {
                  var exportBlob = new Blob([JSON.stringify(blob)], {
                    type: 'application/json;charset=utf-8'
                  });
                  fileName=exportData.backupName+".json";
                  saveAs(exportBlob, fileName);
                  $scope.exportInProgress = false;
                  return $scope.exportFinished = true;
                }
              
                try{
                  if(exportData.exportPrivate && obj.privkey) {
                    var ecKey = Bitcoin.ECKey.decodeEncryptedFormat(obj.privkey, obj.address);
                    var addr = ecKey.getBitcoinAddress().toString();
                    var key = ecKey.getWalletImportFormat();
                    blob.addresses.push({ address: addr, privkey: key, pubkey: obj.pubkey });
                    $scope.progressMessage = "Exported trading address " + addr;
                    $scope.progressColor = "green";
                  }
                  if(exportData.exportWatch && (!obj.privkey && !obj.pubkey)) {
                    blob.addresses.push({ address: obj.address, privkey: "", pubkey:false });
                    $scope.progressMessage = "Exported watch address " + obj.address;
                    $scope.progressColor = "green";
                  }
                  if(exportData.exportOffline && (!obj.privkey && obj.pubkey)) {
                    blob.addresses.push({ address: obj.address, privkey: "", pubkey:true });
                    $scope.progressMessage = "Exported watch address " + obj.address;
                    $scope.progressColor = "green";
                  }
                } catch (e) {
                  $scope.progressMessage = "Error exporting "+obj.address+": " + e;
                  $scope.progressColor = "red";
                }
                $scope.summary.push({color:$scope.progressColor,message: $scope.progressMessage});
                $scope.exported++;
                
                return next();
              });
            };
            
            // Start the loop
            next();
          };
          
          
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };
          
          $scope.close = function() {
            $modalInstance.dismiss('close');
          };
        },
        scope: $scope,
        resolve:{
          wallet: function(){
            return wallet;
          }
        }
      });
    });
  };

  // Begin Import armory offline Form Code
  $scope.openImportArmoryForm = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/import_armory_offline.html',
      controller: AddArmoryAddressModal
    });

    modalInstance.result.then(function(result) {

      if (result.address) {
        $injector.get('userService').addAddress(result.address,undefined,result.pubkey);
      }
      $scope.refresh();
      $scope.addedNewAddress = true;
      $scope.createdAddress = result.address;
    }, function() {});
  };
  
  var AddArmoryAddressModal = function($scope, $modalInstance) {
    $scope.validate = function(newAddress) {
      try{
        var address = new Bitcoin.Address.fromPubKey(Bitcoin.Util.hexToBytes(newAddress.pubkey))
        if(Bitcoin.Address.validate(address.toString())){
          newAddress.address=address.toString();
          return true
        }
      } catch (e) {
        return false;
      }
    };

    $scope.addressNotListed = function(pubkey) {
      var addresses = $injector.get('userService').getAllAddresses();
      var address = new Bitcoin.Address.fromPubKey(Bitcoin.Util.hexToBytes(pubkey));
      for (var i in addresses) {
        if (addresses[i].address == address.toString()) {
          return false;
        }
      }

      return true;
    };

    $scope.ok = function(result) {
      try{
        var address = new Bitcoin.Address.fromPubKey(Bitcoin.Util.hexToBytes(result.pubkey));
        if(Bitcoin.Address.validate(address.toString())){
          $modalInstance.close(result);
        }
      } catch (e) {
        console.log('*** Invalid pubkey: ' + result.pubkey);
      }
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  // Begin Import watch only Form Code
  $scope.openImportWatchOnlyForm = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/import_watch_only.html',
      controller: AddBtcAddressModal
    });

    modalInstance.result.then(function(result) {

      if (result.address) {
        $injector.get('userService').addAddress(result.address);
      }
      $scope.refresh();
      $scope.addedNewAddress = true;
      $scope.createdAddress = result.address;
    }, function() {});
  };

  var AddBtcAddressModal = function($scope, $modalInstance) {
    $scope.validate = function(address) {
      return Bitcoin.Address.validate(address);
    };

    $scope.addressNotListed = function(address) {
      var addresses = $injector.get('userService').getAllAddresses();
      for (var i in addresses) {
        if (addresses[i].address == address) {
          return false;
        }
      }

      return true;
    };

    $scope.ok = function(result) {
      if (Bitcoin.Address.validate(result.address))
        $modalInstance.close(result);
      else
        console.log('*** Invalid address: ' + result.address);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  // Done Import Watch Only Form Code.

  // Begin Import Private Key Form Code
  $scope.openImportPrivateKeyForm = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/import_private.html',
      controller: AddPrivateKeyModal
    });

    modalInstance.result.then(function(result) {

      if (result.privKey) {
        // Use address as passphrase for now
        var addr = decodeAddressFromPrivateKey(result.privKey);
        $injector.get('userService').addAddress(
        addr,
        encodePrivateKey(result.privKey, addr));
      }
      $scope.refresh();
      $scope.addedNewAddress = true;
      $scope.createdAddress = decodeAddressFromPrivateKey(result.privKey);
    }, function() {});
  };

  var AddPrivateKeyModal = function($scope, $modalInstance) {
    $scope.validate = function(address) {
      if (!address) return false;

      try {
        var eckey = new Bitcoin.ECKey(address);
        var addr = eckey.getBitcoinAddress().toString();
        return true;
      } catch (e) {
        return false;
      }
    };

    $scope.ok = function(result) {
      $modalInstance.close(result);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  // Done Import Private Key Form Code.
  // Begin Import Encrypted Key Form Code
  $scope.openImportEncryptedKeyForm = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/import_encrypted_private.html',
      controller: AddEncryptedPrivateModal
    });

    modalInstance.result.then(function(result) {

      if (result.encryptedPrivKey && result.password) {
        // Decrypt key then store with default password of addr
        var key = Bitcoin.ECKey.decodeEncryptedFormat(result.encryptedPrivKey, result.password);
        var privkey = Bitcoin.Util.bytesToHex(key.getPrivateKeyByteArray());
        // Use address as passphrase for now
        var addr = decodeAddressFromPrivateKey(privkey);
        $injector.get('userService').addAddress(
        addr,
        encodePrivateKey(privkey, addr));
      }
      $scope.refresh();

    }, function() {});
  };

  var AddEncryptedPrivateModal = function($scope, $modalInstance) {
    $scope.ok = function(result) {
      $modalInstance.close(result);
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
  };
  // Done Import Encrypted Private Key Code.

  // Begine Create Form Code.
  $scope.createBTCAddress = createBTCAddress;
  function createBTCAddress() {
    var ecKey = new Bitcoin.ECKey();
    var address = ecKey.getBitcoinAddress().toString();
    var encryptedPrivateKey = ecKey.getEncryptedFormat(address);
    $injector.get('userService').addAddress(address, encryptedPrivateKey);
    $scope.refresh();
    $scope.addedNewAddress = true;
    $scope.createdAddress = address;
  }
  ;
  // Done Create Form Code.
  // Begin Import Backup Form Code
  $scope.openImportWalletForm = function() {
    var modalInstance = $modal.open({
      templateUrl: '/partials/import_wallet.html',
      controller: ImportWalletModal
    });
    
    modalInstance.result.then(function(wallet){
      $scope.refresh();
    });
  };
  
  var ImportWalletModal = function($scope, $modalInstance, $q, $timeout) {
    $scope.summary = [];
    $scope.importFinished = false;
    $scope.startImport = function(walletData){
      $scope.validate(walletData).then(function(result){$scope.ok(result);},function(reason){$scope.progressMessage= reason;$scope.progressColor = "red";});
    };
    $scope.validate = function(backup) {
      var deferred = $q.defer();
      
      if (!backup) deferred.reject("No File");
      $scope.processing = true;
      try {
        var wallet = JSON.parse(backup);
        $scope.completed = 0;
        $scope.total = wallet.addresses.length;
        
        var next = function(){
          $timeout(function(){
            return validateAddress(wallet.addresses[$scope.completed]);
          },0,false);
        };
        var validated = {
          addresses : []
        };
        
        var validateAddress = function(address){
          $scope.$apply(function(){
            if($scope.completed == $scope.total){
              $scope.progressMessage = "Validated!";
              $scope.progressColor = "green";
              return deferred.resolve(validated);
            }

            try{
              var addr = address.address;
              if(address.privkey){
                var eckey = new Bitcoin.ECKey(address.privkey);
                addr = eckey.getBitcoinAddress().toString();
              }
              
              if(Bitcoin.Address.validate(addr)){
                validated.addresses.push(address);
                $scope.progressMessage = "Validated address " + addr;
                $scope.progressColor = "green";
              } else {
                $scope.progressMessage = "Invalid address " + addr;
                $scope.progressColor = "red";
              }
            } catch (e) {
              $scope.progressMessage = "Error validating "+addr+": " + e;
              $scope.progressColor = "red";
            }
            $scope.summary.push({message:$scope.progressMessage,color:$scope.progressColor});
            $scope.completed++;
            
            return next();
          });
          
        };
        
        // Start the loop
        next();
        
        deferred.notify("Validating...");
      } catch (e) {
        deferred.reject("Error during validation:" +e);
      }
      
      return deferred.promise;
    };

    $scope.ok = function(wallet) {
      if (wallet) {
        $scope.total = wallet.addresses.length;
        $scope.completed = 0;
        var next = function(){
          if($scope.completed < $scope.total) $scope.progressMessage="Importing address " + wallet.addresses[$scope.completed].address;
          $timeout(function(){
            return importAddress(wallet.addresses[$scope.completed]);
          },0,false);
        };
        
        var importAddress = function(addr){
          $scope.$apply(function(){
            if($scope.completed == $scope.total){
              $scope.importFinished = true;
              $scope.processing = false;
              return;
            }
            
            // Use address as passphrase for now
            if(addr.privkey) 
              $injector.get('userService').addAddress(
                addr.address,
                encodePrivateKey(addr.privkey, addr.address))
                .then(function(){
                  $scope.progressMessage="Imported address " + addr.address;
                  $scope.progressColor = "green";
                  
                  $scope.summary.push({message:$scope.progressMessage,color:$scope.progressColor});
                  $scope.completed++;
                  return next();
                });
            else
              $injector.get('userService').addAddress(
                addr.address, undefined, addr.pubkey)
                .then(function(){
                  $scope.progressMessage="Imported address " + addr.address;
                  $scope.progressColor = "green";
                  
                  $scope.summary.push({message:$scope.progressMessage,color:$scope.progressColor});
                  $scope.completed++;
                  return next();
                });   
                
            
          });
        };
        
        next();
      }
    };

    $scope.cancel = function() {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.close = function() {
      $modalInstance.dismiss('close');
    };
  };
  // Done Import Import Backup Form Code.
  


  $scope.enumerateAddresses = function() {

    $scope.items = enumerated_addresses.getData().then(function(result) {
      if (result.addresses.length == 0) {
        createBTCAddress();
	      $scope.newAddress=true;
      }
      $scope.addresses = result.addresses;
    });
  };


});




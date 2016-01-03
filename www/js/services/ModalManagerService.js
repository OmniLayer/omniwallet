angular.module("omniServices")
    .service("ModalManager", ["$modal", "$rootScope", "$timeout","TransactionGenerator","TransactionManager","Account","Wallet",
        function ModalManagerService($modal, $rootScope, $timeout, TransactionGenerator, TransactionManager, Account, Wallet) {
          var self = this;

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

          self.openCreateModal = function() {
              var modalScope = $rootScope.$new()
              modalScope.title ='Create New Wallet';
              modalScope.button ='Create Wallet';
              modalScope.bodyTemplate = "/views/modals/partials/create.html";
              modalScope.footerTemplate = "/views/modals/partials/create_footer.html";
              
              self.modalInstance = $modal.open({
                templateUrl: '/views/modals/base.html',
                controller: function CreateWalletController($scope, $location, $modalInstance, $idle, Account, AddressManager) {
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

                  $scope.setFormScope = function(form){
                    $scope.createForm = form;
                  }

                  $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
                },
                scope: modalScope,
                backdrop:'static'
              });
          };

          self.openLoginModal = function() {  
              var modalScope = $rootScope.$new()
              modalScope.title = 'Login';
              modalScope.button = 'Open Wallet';
              modalScope.bodyTemplate = "/views/modals/partials/login.html";
              modalScope.footerTemplate = "/views/modals/partials/login_footer.html";
              

              self.modalInstance = $modal.open({
                templateUrl: '/views/modals/base.html',
                controller: LoginController,
                scope: modalScope,
                backdrop:'static'
              });
          };
          
          self.openConfirmationModal = function(modalConfig) {
              self.modalInstance = $modal.open({
                  templateUrl: "/views/modals/base.html",
                  controller: function ConfirmationModalController($scope, $modalInstance, modalConfig, modalManager) {                        
                      angular.extend($scope, modalConfig.scope);

                      $scope.bodyTemplate = modalConfig.bodyTemplate || "/views/modals/confirmation.html";
                      $scope.footerTemplate = modalConfig.footerTemplate || "/views/modals/partials/confirmation_footer.html";
                      $scope.dataTemplate = modalConfig.dataTemplate || "";

                      $scope.signOffline = modalConfig.transaction.offline;

                      $scope.transaction = modalConfig.transaction;
                      
                      $scope.confirm = function() {
                          $scope.clicked = true;
                          $scope.waiting = true;

                          TransactionManager.processTransaction($scope.transaction).then(function(result){
                          	angular.extend($scope,result)
                          }, function(errorData){
                          	angular.extend($scope,errorData)
                          });
                      };

                      $scope.fromAddress = modalConfig.transaction.address.hash;

                      $scope.openBroadcastTransactionForm = function(address) {
                          $modalInstance.dismiss('close');
                          modalManager.openBroadcastTransactionModal(address);
                      };

                      $scope.saveUnsigned = function(unsignedHex) {
                          var exportBlob = new Blob([unsignedHex], {
                              type: 'application/json;charset=utf-8'
                          });
                          fileName = "tx" + (new Date).getTime() + ".unsigned.tx";
                          saveAs(exportBlob, fileName);
                          $scope.unsaved = false;
                          $scope.saved = true;
                      };

                      $scope.cancel = function() {
                          $modalInstance.dismiss('cancel');
                      };

                      $scope.close = function() {
                          $modalInstance.dismiss('close');
                      };
                  },
                  resolve: {
                      modalConfig: function() {
                          return modalConfig;
                      },
                      modalManager: function() {
                          return self;
                      },
                  }
              });
          };

          self.openBroadcastArmoryOfflineTransactionModal = function(address) {

              self.modalInstance = $modal.open({
                  templateUrl: "/views/modals/broadcast.html",
                  controller: function BroadcastModalController($scope, $modalInstance, address, broadcastTransaction) {
                      $scope.broadcastAddress = address;

                      $scope.ok = function(signedHex) {
                          $scope.clicked = true;
                          $scope.waiting = true;
                          broadcastTransaction(signedHex, address, $scope);
                      };

                      $scope.cancel = function() {
                          $modalInstance.dismiss('cancel');
                          self.modalInstance = null;
                      };

                      $scope.close = function() {
                          $modalInstance.dismiss('close');
                          self.modalInstance = null;
                      };
                  },
                  resolve: {
                      broadcastTransaction: function() {
                          return function(signedHex, from, $modalScope){
                            TransactionGenerator.getArmoryRaw(signedHex).then(function(result){
                              var finalTransaction = result.data.rawTransaction;
                            
                              //Showing the user the transaction hash doesn't work right now
                              //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());

                              TransactionGenerator.pushSignedTransaction(finalTransaction).then(function(successData) {
                                var successData = successData.data;
                                if (successData.pushed.match(/submitted|success/gi) != null) {
                                  $modalScope.waiting = false;
                                  $modalScope.transactionSuccess = true;
                                  $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
                                } else {
                                  $modalScope.waiting = false;
                                  $modalScope.transactionError = true;
                                  $modalScope.error = successData.pushed; //Unspecified error, show user
                                }
                              }, function(errorData) {
                                $modalScope.waiting = false;
                                $modalScope.transactionError = true;
                                if (errorData.message)
                                  $modalScope.error = 'Server error: ' + errorData.message;
                                else 
                                  if (errorData.data)
                                    $modalScope.error = 'Server error: ' + errorData.data;
                                  else
                                    $modalScope.error = 'Unknown Server Error';
                                console.error(errorData);
                              });
                            })
                          };
                      },
                      address: function() {
                          return address;
                      }
                  }
              });
          };

          self.openBackupWalletModal = function() {
              var exportScope = $rootScope.$new();
              exportScope.exportInProgress=false;
              exportScope.exportData={}
              var exportModalInstance = $modal.open({
                templateUrl: '/views/modals/export_wallet.html',
                controller: function($scope, $modalInstance, Account, Wallet){
                  $scope.exportData.backupName = Account.uuid;
                  $scope.summary = [];
                  $scope.exportFinished = false;
                  $scope.exportWallet = function(exportData){
                    Account.verify(Account.uuid, exportData.passphrase).then(function(result){
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
                            if(obj.privkey) {
                              var ecKey = Bitcoin.ECKey.decodeEncryptedFormat(obj.privkey, obj.hash);
                              var addr = ecKey.getBitcoinAddress().toString();
                              var key = ecKey.getWalletImportFormat();
                              blob.addresses.push({ address: addr, privkey: key, pubkey: obj.pubkey });
                              $scope.progressMessage = "Exported trading address " + addr;
                              $scope.progressColor = "green";
                            }
                            if((!obj.privkey && !obj.pubkey)) {
                              blob.addresses.push({ address: obj.hash, privkey: "", pubkey:"" });
                              $scope.progressMessage = "Exported watch address " + obj.hash;
                              $scope.progressColor = "green";
                            }
                            if((!obj.privkey && obj.pubkey)) {
                              blob.addresses.push({ address: obj.hash, privkey: "", pubkey:obj.pubkey });
                              $scope.progressMessage = "Exported offline address " + obj.hash;
                              $scope.progressColor = "green";
                            }
                          } catch (e) {
                            $scope.progressMessage = "Error exporting "+obj.hash+": " + e;
                            $scope.progressColor = "red";
                          }
                          $scope.summary.push({color:$scope.progressColor,message: $scope.progressMessage});
                          $scope.exported++;
                          
                          return next();
                        });
                      };
                      
                      // Start the loop
                      next();
                    })
                  };
                  
                  
                  $scope.cancel = function() {
                    $modalInstance.dismiss('cancel');
                  };
                  
                  $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
                },
                scope: exportScope
              });
            });
          };
          // Begin Import Backup Form Code
          self.openImportWalletModal = function() {
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
                        Account.addAddress(
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
                        Account.addAddress(
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
            self.modalInstance = $modal.open({
              templateUrl: '/partials/import_wallet.html',
              controller: ImportWalletModal
            });
            
            self.modalInstance.result.then(function(wallet){
              //$scope.refresh();
            });
          };
          
          // Done Import Import Backup Form Code.

          self.openDeleteConfirmModal = function(addritem) {
              self.modalInstance = $modal.open({
                templateUrl: '/partials/delete_address_modal.html',
                controller: DeleteBtcAddressModal,
                resolve: {
                  address: function() {
                    return addritem;
                  }
                }
              });
              self.modalInstance.result.then(function() {
                Account.removeAddress(addritem.hash);
                });
          };

          var DeleteBtcAddressModal = function($scope, $modalInstance, address) {
            $scope.address = address.hash;
            $scope.private = address.privkey != undefined;

            $scope.ok = function() {
              $modalInstance.close();
            };

            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
          };

          self.openImportArmoryForm = function() {
            var modalInstance = $modal.open({
              templateUrl: '/views/modals/import_armory_offline.html',
              controller: AddArmoryAddressModal,

            });
        
            modalInstance.result.then(function(result) {
        
              if (result.address) {
                Account.addAddress(result.address,undefined,result.pubkey);
              }
            }, function() {});
          };
          
          var AddArmoryAddressModal = function($scope, $modalInstance) {
            $scope.title = "MODALS.IMPORT.OFFLINE.TITLE";
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
              var addresses = Wallet.addresses;
              var address = new Bitcoin.Address.fromPubKey(Bitcoin.Util.hexToBytes(pubkey));
              for (var i in addresses) {
                if (addresses[i].hash == address.toString()) {
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
            $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
          };
          // Begin Import watch only Form Code
          self.openImportWatchOnlyForm = function() {
            var modalInstance = $modal.open({
              templateUrl: '/views/modals/import_watch_only.html',
              controller: AddBtcAddressModal
            });
        
            modalInstance.result.then(function(result) {
        
              if (result.address) {
                Account.addAddress(result.address);
              }
            }, function() {});
          };
        
          var AddBtcAddressModal = function($scope, $modalInstance) {
            $scope.title = "MODALS.IMPORT.WATCH.TITLE"
            $scope.validate = function(address) {
              return Bitcoin.Address.validate(address);
            };
        
            $scope.addressNotListed = function(address) {
              var addresses = Wallet.addresses;
              for (var i in addresses) {
                if (addresses[i].hash == address) {
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
            $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
          };
          // Done Import Watch Only Form Code.
        
          // Begin Import Private Key Form Code
          self.openImportPrivateKeyForm = function() {
            var modalInstance = $modal.open({
              templateUrl: '/views/modals/import_private.html',
              controller: AddPrivateKeyModal
            });
        
            modalInstance.result.then(function(result) {
        
              if (result.privKey) {
                // Use address as passphrase for now
                var addr = decodeAddressFromPrivateKey(result.privKey);
                Account.addAddress(
                addr,
                encodePrivateKey(result.privKey, addr));
              }
            }, function() {});
          };
        
          var AddPrivateKeyModal = function($scope, $modalInstance) {
            $scope.title = "MODALS.IMPORT.PRIVATE.TITLE";
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
            $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
          };
          // Done Import Private Key Form Code.
          // Begin Import Encrypted Key Form Code
          self.openImportEncryptedKeyForm = function() {
            var modalInstance = $modal.open({
              templateUrl: '/views/modals/import_encrypted_private.html',
              controller: AddEncryptedPrivateModal
            });
        
            modalInstance.result.then(function(result) {
        
              if (result.encryptedPrivKey && result.password) {
                // Decrypt key then store with default password of addr
                var key = Bitcoin.ECKey.decodeEncryptedFormat(result.encryptedPrivKey, result.password);
                var privkey = Bitcoin.Util.bytesToHex(key.getPrivateKeyByteArray());
                // Use address as passphrase for now
                var addr = decodeAddressFromPrivateKey(privkey);
                Account.addAddress(
                addr,
                encodePrivateKey(privkey, addr));
              }
        
            }, function() {});
          };
        
          var AddEncryptedPrivateModal = function($scope, $modalInstance) {
            $scope.title = "MODALS.IMPORT.ENCRYPTED.TITLE";
            $scope.ok = function(result) {
              $modalInstance.close(result);
            };
        
            $scope.cancel = function() {
              $modalInstance.dismiss('cancel');
            };
            $scope.close = function() {
                    $modalInstance.dismiss('close');
                  };
          };
        }
    ])
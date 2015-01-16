angular.module("omniServices")
    .service("ModalManager", ["$modal", "$rootScope", "$timeout","TransactionGenerator","TransactionManager","Account",
        function ModalManagerService($modal, $rootScope, $timeout, TransactionGenerator, TransactionManager, Account) {
            var self = this;

            function encodePrivateKey(key, passphrase) {
  
              //  Return encoded key.  Forget the passphrase forever.
              var eckey = new Bitcoin.ECKey(key);
              var enc = eckey.getEncryptedFormat(passphrase);
          
              return enc;
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
                        
                        $scope.confirm = function() {
                            $scope.clicked = true;
                            $scope.waiting = true;

                            TransactionManager.processTransaction(modalConfig.transaction).then(function(result){
                            	angular.extend($scope,result)
                            }, function(errorData){
                            	angular.extend($scope,errorData)
                            });
                        };

                        $scope.fromAddress = modalConfig.transaction.address.address;

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
                    controller: function($scope, $modalInstance, address, broadcastTransaction) {
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
              var scope = $rootScope.$new();
              scope.login={
                        uuid: Account.uuid,
                        action: 'verify',
                        title: 'Verify Account',
                        button: 'Validate',
                        disable: true //disable UUID field in template
                    }
              self.modalInstance = $modal.open({
                templateUrl: '/partials/login_modal.html',
                controller: LoginController,
                scope: scope
              });
          
              self.modalInstance.result.then(function(wallet) {
                var exportScope = $rootScope.$new();
                exportScope.exportInProgress=false;
                exportScope.exportData={
                      backupName : wallet.uuid,
                      exportPrivate : true,
                      exportWatch : true,
                      exportOffline:true
                    }
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
                              blob.addresses.push({ address: obj.address, privkey: "", pubkey:"" });
                              $scope.progressMessage = "Exported watch address " + obj.address;
                              $scope.progressColor = "green";
                            }
                            if(exportData.exportOffline && (!obj.privkey && obj.pubkey)) {
                              blob.addresses.push({ address: obj.address, privkey: "", pubkey:obj.pubkey });
                              $scope.progressMessage = "Exported offline address " + obj.address;
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
                  scope: exportScope,
                  resolve:{
                    wallet: function(){
                      return wallet;
                    }
                  }
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
                  Account.removeAddress(addritem.address);
                  });
            };
        }
    ])
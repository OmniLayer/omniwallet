angular.module("omniServices")
    .service("ModalManager", ["$modal", "TransactionGenerator","TransactionManager",
        function ModalManagerService($modal, TransactionGenerator, TransactionManager) {
            var self = this;

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
        }
    ])
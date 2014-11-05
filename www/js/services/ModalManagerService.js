angular.module("omniServices")
    .service("ModalManager", ["$modal", "WalletAssets", "TransactionGenerator"

        function ModalManagerService($modal, WalletAssets) {
            var self = this;

            self.openConfirmationModal = function(modalConfig) {
                self.modalInstance = $modal.open({
                    templateUrl: "/views/modals/base.html",
                    controller: function ConfirmationModalController($scope, $modalInstance, walletAssets, modalConfig, modalManager) {
                        angular.extend($scope, modalConfig.scope);

                        $scope.bodyTemplate = $scope.bodyTemplate || "/views/modals/confirmation.html";
                        $scope.footerTemplate = $scope.footerTemplate || "/views/modals/partials/confirmation_footer.html";
                        $scope.dataTemplate = modalConfig.dataTemplate || "";

                        $scope.signOffline = walletAssets.offline;
                        
                        $scope.confirm = function() {
                            $scope.clicked = true;
                            $scope.waiting = true;
                            modalConfig.confirm().then(function(result){
                            	angular.extend($scope,result)
                            }, function(errorData){
                            	angular.extend($scope,errorData)
                            });
                        };

                        $scope.fromAddress = modalConfig.fromAddress;

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
                        walletAssets: function() {
                            return WalletAssets;
                        },
                        modalConfig: function() {
                            return modalConfig;
                        },
                        modalManager: function() {
                            return self;
                        },
                    }
                });
            };

            self.openBroadcastTransactionModal = function(address) {

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
                            return f


                        },
                        address: function() {
                            return address;
                        }
                    }
                });
            };
        }
    ])
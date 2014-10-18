function TransactionGenerationController($scope, $modal, userService, walletTransactionService){
  
  $scope.prepareTransaction = function(txType, rawdata, from, $modalScope){
    var addressData = userService.getAddress(from);
    var pubKey = null;
    if(addressData.pubkey)
      pubKey= addressData.pubkey.toUpperCase();
    else{
      var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
      pubKey = privKey.getPubKeyHex();
    }
    var data = rawdata instanceof Array ? rawdata : [rawdata];

    pushOrderedTransactions(data,0);
    
    function pushOrderedTransactions(transactions,index){
      var txdata = transactions[index];
      txdata['pubkey'] = pubKey;
      $scope.TxPromise = walletTransactionService.getUnsignedTransaction(txType,txdata);
      $scope.TxPromise.then(function(successData) {
        var successData = successData.data;
        if (successData.status != 200 && successData.status != "OK") { /* Backwards compatibility for mastercoin-tools send API */
          $modalScope.waiting = false;
          $modalScope.transactionError = true;
          $modalScope.error = 'Error preparing transaction: ' + successData.error || successData.data; /* Backwards compatibility for mastercoin-tools send API */
        } else {
          var unsignedTransaction = successData.unsignedhex || successData.transaction; /* Backwards compatibility for mastercoin-tools send API */

          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          var script = parseScript(successData.sourceScript);

          if(transaction.ins.length == 0){
            $modalScope.waiting = false;
            $modalScope.transactionError = true;
            $modalScope.error = 'Error: Not enough inputs in the address!';
          }
             
          transaction.ins.forEach(function(input) {
            input.script = script;
          });
          if($modalScope.signOffline){
            var parsedBytes = transaction.serialize();

            walletTransactionService.getArmoryUnsigned(Bitcoin.Util.bytesToHex(parsedBytes),pubKey).then(function(result){
              $modalScope.unsignedTransaction = result.data.armoryUnsigned;
              $modalScope.waiting = false;
              $modalScope.readyToSign = true;
              $modalScope.unsaved=true;  
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
          } else {
            try {
              //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()));
              var signedSuccess = transaction.signWithKey(privKey);
    
              var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());
    
              //Showing the user the transaction hash doesn't work right now
              //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());
    
              walletTransactionService.pushSignedTransaction(finalTransaction).then(function(successData) {
                var successData = successData.data;
                if (successData.pushed.match(/submitted|success/gi) != null) {
                  if(index +1 == transactions.length){
                    $modalScope.waiting = false;
                    $modalScope.transactionSuccess = true;
                    $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
                  } else {
                    pushOrderedTransactions(transactions,index+1);
                  }
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
    
              //DEBUG console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );
              function parseScript(script) {
                var newScript = new Bitcoin.Script();
                var s = script.split(" ");
                for (var i = 0; i < s.length; i++) {
                  if (Bitcoin.Opcode.map.hasOwnProperty(s[i])) {
                    newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
                  } else {
                    newScript.writeBytes(Bitcoin.Util.hexToBytes(s[i]));
                  }
                }
                return newScript;
              }
            } catch (e) {
              $modalScope.sendError = true;
              if (e.message)
                $modalScope.error = 'Error sending transaction: ' + e.message;
              else 
                if (e.data) 
                  $modalScope.error = 'Error sending transaction: ' + e.data;
                else
                  $modalScope.error = 'Unknown error sending transaction';
              console.error(e);
            }
          }
        }
      }, function(errorData) {
        $modalScope.sendError = true;
        if (errorData.message)
          $modalScope.error = 'Server error: ' + errorData.message;
        else 
          if (errorData.data)
            $modalScope.error = 'Server error: ' + errorData.data;
          else
            $modalScope.error = 'Unknown Server Error';
        console.error(errorData);
      });
    };
  }; 
  
  $scope.validateForm = function() {
    
    var error = $scope.validateTransactionData();
      
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: $scope.modalTemplateUrl,
        controller: $scope.modalController,
        resolve: angular.extend($scope.modalFactory, $scope.baseFactory)
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.$parent.showErrors = true;
    }
  };

  var modalBaseController = $scope.modalBaseController = function($scope, $modalInstance, data, prepareTransaction, setModalScope, walletAssets) {
    setModalScope($scope);
    $scope.signOffline= walletAssets.offline;
    
    $scope.ok = function() {
      $scope.clicked = true;
      $scope.waiting = true;
      prepareTransaction(data.transactionType, data.transactionData, data.from, $scope);
    };
    
    $scope.saveUnsigned = function(unsignedHex){
      var exportBlob = new Blob([unsignedHex], {
        type: 'application/json;charset=utf-8'
      });
      fileName="tx"+(new Date).getTime()+".unsigned.tx";
      saveAs(exportBlob, fileName);
      $scope.unsaved=false;
      $scope.saved=true;
    };
    
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    
    $scope.close = function () {
      $modalInstance.dismiss('close');
    };

    $scope.openBroadcastTransactionForm = function(address){
      $modalInstance.dismiss('close');
      var broadcastModalInstance = $modal.open({
        templateUrl: "/partials/wallet_broadcast_modal.html",
        controller: function($scope, $modalInstance, address, broadcastTransaction) {
          $scope.broadcastAddress = address;
          
          $scope.ok = function(signedHex) {
            $scope.clicked = true;
            $scope.waiting = true;
            broadcastTransaction(signedHex, address, $scope);
          };
          
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
          
          $scope.close = function () {
            $modalInstance.dismiss('close');
          };
        },
        resolve: {
          broadcastTransaction: function() {
              return function(signedHex, from, $modalScope){
                  var walletTransactionService = $injector.get('walletTransactionService');
                  walletTransactionService.getArmoryRaw(signedHex).then(function(result){
                    var finalTransaction = result.data.rawTransaction;
                  
                    //Showing the user the transaction hash doesn't work right now
                    //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());

                    walletTransactionService.pushSignedTransaction(finalTransaction).then(function(successData) {
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
          }, address: function(){
            return address;
          }
        }
      });
    };
  };


  $scope.baseFactory = {
    data: function() {
      return $scope.generateData();
    },
    prepareTransaction: function() {
        return $scope.prepareTransaction;
    },
    setModalScope: function(){
      return $scope.setModalScope;
    },
    walletAssets: function() {
      return $scope.$parent;
    }
  };

  $scope.modalController = function($scope, $modalInstance, data, prepareTransaction, setModalScope, walletAssets) {
    modalBaseController($scope, $modalInstance, data, prepareTransaction, setModalScope, walletAssets);
  };
   
  $scope.modalFactory = {};
};
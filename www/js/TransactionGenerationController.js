function TransactionGenerationController($scope, $modal, userService, walletTransactionService){
  
  $scope.prepareTransaction = function(txType, data, from, $modalScope){
    var addressData = userService.getAddress(from);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.TxPromise = walletTransactionService.getUnsignedTransaction(txType,data);
    $scope.TxPromise.then(function(successData) {
      var successData = successData.data;
      if (successData.status != 200) {
        $modalScope.waiting = false;
        $modalScope.transactionError = true;
        $modalScope.error = 'Error preparing Property Issuance transaction: ' + successData.data;
      } else {
        var unsignedTransaction = successData.unsignedhex;

        try {
          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          var script = parseScript(successData.sourceScript);

          transaction.ins.forEach(function(input) {
            input.script = script;
          });

          //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()));
          var signedSuccess = transaction.signWithKey(privKey);

          var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());

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
  
  $scope.validateForm = function() {
    
    var error = $scope.validateTransactionData();
      
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: $scope.modalTemplateUrl,
        controller: function($scope, data, prepareTransaction, setModalScope, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          setModalScope($scope);
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            prepareTransaction(data.transactionType, data.transactionData, data.from, $scope);
          };
        },
        resolve: {
          data: function() {
            return $scope.generateData();
          },
          prepareTransaction: function() {
              return $scope.prepareTransaction;
          },
          setModalScope: function(){
            return $scope.setModalScope;
          },
          convertSatoshiToDisplayedValue: function() {
            return $scope.convertSatoshiToDisplayedValue;
          },
          getDisplayedAbbreviation: function() {
            return $scope.getDisplayedAbbreviation;
          }
        }
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.$parent.showErrors = true;
    }
  };
};
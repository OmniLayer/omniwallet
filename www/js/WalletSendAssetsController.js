function WalletSendAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {
  // [ Helper Functions ]

  // [ Send Form Helpers ]

  function getUnsignedSendTransaction(toAddress, pubKey, fromAddress, amount, currency, fee) {
    var url = '/v1/transaction/send/';
    var data = {
      from_address: fromAddress,
      to_address: toAddress,
      amount: amount,
      currency: currency,
      fee: fee,
      marker: $scope.marked,
      pubKey: pubKey
    };
    var promise = $http.post(url, data);

    return promise;
  }

  function prepareSendTransaction(to, from, amt, currency, fee, privkeyphrase, $modalScope) {
    var addressData = userService.getAddress(from);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.sendTxPromise = getUnsignedSendTransaction(to, pubKey, from, amt, currency, fee);
    $scope.sendTxPromise.then(function(successData) {

      if (successData.data.error) {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        $modalScope.error = 'Error preparing send transaction: ' + successData.data.error;
      } else {
        var successData = successData.data;
        var sourceScript = successData.sourceScript;
        var unsignedTransaction = successData.transaction;

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
              $modalScope.sendSuccess = true;
              $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
            } else {
              $modalScope.waiting = false;
              $modalScope.sendError = true;
              $modalScope.error = successData.pushed; //Unspecified error, show user
            }
          }, function(errorData) {
            $modalScope.waiting = false;
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
  }

  $scope.validateSendForm = function() {
    var dustValue = 5430;
    var minerMinimum = 10000;
    var nonZeroValue = 1;
    var divisible = $scope.selectedCoin.divisible; 

    var convertToSatoshi = [
        $scope.minerFees,
        $scope.sendAmount,
        $scope.balanceData[0], 
        $scope.balanceData[1],
        $scope.totalCost
      ];

    if (!divisible) {
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.sendAmount ) ];
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
    }

    var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

    var minerFees = +convertedValues[0];
    var sendAmount = divisible ? +convertedValues[1] : +$scope.sendAmount;
    var totalFeeCost = +convertedValues[4]

    var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
    var btcbalance = +convertedValues[3];

    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    var sendTo = $scope.sendTo;
    var required = [coin, address, sendAmount, sendTo, minerFees, totalFeeCost,  balance, btcbalance, $scope.sendForm.$valid];

    var error = 'Please ';
    if ($scope.sendForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if ((sendAmount <= balance) == false) {
      error += 'make sure you aren\'t sending more tokens than you own, ';
    }
    if ((totalFeeCost <= btcbalance) == false) {
      error += 'make sure you have enough Bitcoin to cover your transaction costs, ';
    }
    if (walletTransactionService.validAddress(sendTo) == false) {
      error += 'make sure you are sending to a valid MSC/BTC address, ';
    }
    if (coin == 'BTC') {
      if (sendAmount < dustValue)
        error += 'make sure your send amount is at least 0.00005430 BTC if sending BTC, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
    }
    if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (sendAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC, ';
    }
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/wallet_send_modal.html',
        controller: function($scope, $rootScope, userService, data, prepareSendTransaction, getUnsignedSendTransaction,convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=  convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=  getDisplayedAbbreviation,
          $scope.sendAmount= data.amt,
          $scope.minerFees= data.fee,
          $scope.sendTo= data.sendTo;
          $scope.totalCost= data.totalCost;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            prepareSendTransaction(data.sendTo, data.sendFrom, data.amt, data.coin, data.fee, $scope.privKeyPass, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              sendTo: sendTo,
              sendFrom: address,
              amt: sendAmount,
              coin: coin,
              fee: minerFees,
              totalCost: totalFeeCost
            };
          },
          prepareSendTransaction: function() {
            return prepareSendTransaction;
          },
          getUnsignedSendTransaction: function() {
            return getUnsignedSendTransaction;
          },
          pushSignedTransaction: function() {
            return walletTransactionService.pushSignedTransaction;
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
}



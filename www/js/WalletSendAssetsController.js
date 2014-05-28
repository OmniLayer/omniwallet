function WalletSendAssetsController($modal, $scope, $http, $q, userService, walletTradeService) {
  // [ Helper Functions ]

  function convertSatoshiToDisplayedValue(satoshi) {
    if ($scope.selectedCoin.symbol == 'BTC')
      return satoshi / 100000.0;
    else if ($scope.selectedCoin.symbol.indexOf('SP') == 0) {
      for (var i in $scope.currencyList) {
        if ($scope.currencyList[i].symbol == $scope.selectedCoin.symbol) {
          if ($scope.currencyList[i].property_type == 1)
            return satoshi;
          else
            return satoshi / 100000000.0;
        }
      }
      return satoshi / 100000000.0;
    } else {
      return satoshi / 100000000.0;
    }
  }

  $scope.convertSatoshiToDisplayedValue = convertSatoshiToDisplayedValue;

  function getDisplayedAbbreviation() {
    if ($scope.selectedCoin.symbol == 'BTC')
      return 'mBTC';
    else if ($scope.selectedCoin.symbol.indexOf('SP') == 0) {
      for (var i in $scope.currencyList) {
        if ($scope.currencyList[i].symbol == $scope.selectedCoin.symbol)
          return $scope.currencyList[i].name + ' #' + $scope.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
      }

      return 'Smart Property #' + $scope.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
    }
    else
      return $scope.selectedCoin.symbol;
  }
  $scope.getDisplayedAbbreviation = getDisplayedAbbreviation;

  function convertDisplayedValueToSatoshi(value) {
    if ($scope.selectedCoin.symbol == 'BTC') {
      return Math.ceil(value * 100000);
    } else if ($scope.selectedCoin.symbol.indexOf('SP') == 0) {
      for (var i in $scope.currencyList) {
        if ($scope.currencyList[i].symbol == $scope.selectedCoin.symbol) {
          if ($scope.currencyList[i].property_type == 1)
            return Math.ceil(value);
          else
            return Math.ceil(value * 100000000);
        }
      }
      return Math.ceil(value * 100000000);
    } else {
      return Math.ceil(value * 100000000);
    }
  }
  

  


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

          walletTradeService.pushSignedTransaction(finalTransaction).then(function(successData) {
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

    var minerFees = Math.ceil($scope.minerFees * 100000);
    var sendAmount = convertDisplayedValueToSatoshi($scope.sendAmount);

    var balance = +$scope.balanceData[0];
    var btcbalance = +$scope.balanceData[1];

    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    var sendTo = $scope.sendTo;
    var required = [coin, address, sendAmount, sendTo, minerFees, balance, btcbalance, $scope.sendForm.$valid];

    var error = 'Please ';
    if ($scope.sendForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if ((sendAmount <= balance) == false) {
      error += 'make sure you aren\'t sending more coins than you own, ';
    }
    if ((minerFees <= btcbalance) == false) {
      error += 'make sure you have enough Bitcoin to cover your fees, ';
    }
    if (walletTradeService.validAddress(sendTo) == false) {
      error += 'make sure you are sending to a valid MSC/BTC address, ';
    }
    if (coin == 'BTC') {
      if (sendAmount < dustValue)
        error += 'make sure your send amount is at least 0.05430 mBTC if sending BTC, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.1 mBTC to cover miner costs, ';
    }
    if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (sendAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.1 mBTC, ';
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
              fee: minerFees
            };
          },
          prepareSendTransaction: function() {
            return prepareSendTransaction;
          },
          getUnsignedSendTransaction: function() {
            return getUnsignedSendTransaction;
          },
          pushSignedTransaction: function() {
            return walletTradeService.pushSignedTransaction;
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



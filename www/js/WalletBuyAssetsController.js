function WalletBuyAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {
    // [ Template Initialization ]

  $scope.currencyBuyList = $scope.currencyList.filter(function(currency){
    if (currency.symbol == $scope.activeCurrencyPair[1] )
      $scope.$parent.$parent.selectedCoin = currency;
    return currency.symbol == $scope.activeCurrencyPair[1];
  });
  

  $scope.currencyList.forEach(function(e, i) {
    if (e.symbol == "BTC"){
      $scope.addressList = userService.getAddressesWithPrivkey(e.tradableAddresses);
      $scope.$parent.$parent.selectedAddress = $scope.addressList[0];
    }
  });

  // [ Buy Form Helpers ]

  function getUnsignedBuyTransaction(buyerAddress, pubKey, buyAmount, fee, saleTransactionHash) {
    var deferred = $q.defer();

    var url = '/v1/exchange/accept/';
    $http.post(url, {
        buyer: buyerAddress,
        pubKey: pubKey,
        amount: buyAmount,
        fee: fee,
        tx_hash: saleTransactionHash
      }).success(function(data) {
        return deferred.resolve(data);
      }).error(function(data) {
      return deferred.reject(data);
    });

    return deferred.promise;
  }

  function prepareBuyTransaction(buyer, amt, hash, fee, privkeyphrase, $modalScope) {
    var addressData = userService.getAddress(buyer);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.sendTxPromise = getUnsignedBuyTransaction(buyer, pubKey, amt, fee, hash);
    $scope.sendTxPromise.then(function(successData) {
      if (successData.status != 'OK') {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        $modalScope.error = 'Error preparing buy transaction: ' + successData.data.error;
      } else {
        //var successData = successData.data ??
        var sourceScript = successData.sourceScript;
        var unsignedTransaction = successData.transaction;

        try {

          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          var script = parseScript(successData.sourceScript);

          transaction.ins[0].script = script;

          //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()))
          var signedSuccess = transaction.signWithKey(privKey);

          var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());

          //Showing the user the transaction hash doesn't work right now
          //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse())

          walletTransactionService.pushSignedTransaction(finalTransaction).then(function(successData) {
            var successData = successData.data;
            if (successData.pushed.match(/submitted|success/gi) != null) {
              $modalScope.waiting = false;
              $modalScope.sendSuccess = true;
              $modalScope.url = 'http://blockchain.info/address/' + buyer + '?sort=0';
            } else {
              $modalScope.waiting = false;
              $modalScope.sendError = true;
              $modalScope.error = successData.pushed; //Unspecified error, show user
            }
            console.log('server response: ', successData);
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
            console.log('server error: ', errorData);
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
          console.log('Error sending transaction', e);
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
      console.log('server error: ', errorData);
    });
  }

  $scope.validateBuyForm = function() {
    var dustValue = 5430;
    var minerMinimum = 10000;
    var nonZeroValue = 1;
    var divisible = $scope.selectedCoin.divisible; 

    var convertToSatoshi = [
        $scope.minerFees,
        $scope.buyAmount,
        $scope.balanceData[0], 
        $scope.balanceData[1]
      ];

    if (!divisible) {
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.saleAmount ) ];
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
    }

    var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

    var minerFees = +convertedValues[0];
    var buyAmount = divisible ? +convertedValues[1] : +$scope.buyAmount;
    
    var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
    var btcbalance = +convertedValues[3];

    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    var saleHash = $scope.buySaleID;

    var required = [coin, address, buyAmount, minerFees, balance, btcbalance, $scope.buyForm.$valid];
    console.log(required);
    var error = 'Please ';
    if ($scope.buyForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    //should be valid hash
    //if( walletTransactionService.validAddress(sendTo) == false) {
    //   error += 'make sure you are sending to a valid MSC/BTC address, '
    //}
    if (coin == 'BTC') {
      error += 'make sure your sale is for MSC or TMSC, ';
    }
    if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (buyAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC, ';
      if ((minerFees <= btcbalance) == false)
        error += 'make sure you have enough Bitcoin to cover your fees, ';
    }
    if (error.length < 8) {
      $scope.$parent.showErrors = false;

      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/wallet_buy_modal.html',
        controller: function($scope, $rootScope, userService, data, prepareBuyTransaction, getUnsignedBuyTransaction, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=getDisplayedAbbreviation,
          $scope.buyAmount=data.amt,
          $scope.minerFees= data.fee,
          $scope.selectedCoin= data.selectedCoin;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            prepareBuyTransaction(data.buyer, data.amt, data.hash, data.fee, $scope.privKeyPass, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              buyer: address,
              amt: buyAmount,
              hash: saleHash,
              fee: minerFees,
              selectedCoin: $scope.selectedCoin,
            };
          },
          prepareBuyTransaction: function() {
            return prepareBuyTransaction;
          },
          getUnsignedBuyTransaction: function() {
            return getUnsignedBuyTransaction;
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

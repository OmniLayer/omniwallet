function WalletBuyAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {
    // [ Template Initialization ]
    
  $scope.currencyList.forEach(function(e, i) {
    if (e.symbol == "BTC"){
      $scope.addressList = userService.getAddressesWithPrivkey(e.tradableAddresses);
      $scope.$parent.$parent.selectedAddress = $scope.addressList[0];
    }
  });
  
  // OInitialize values.
  var transaction = $scope.global['buyOffer'];
  $scope.buySaleID = transaction.tx_hash;
  $http.get('/v1/transaction/tx/' + transaction.tx_hash + '.json').success(function(data) {
    var tx = data[0];
    $scope.selectedCoin=tx.currency_str;

    if(parseInt(tx.currencyId) <3) {
      $scope.divisible = true;
      $scope.sendPlaceholderValue = '1.00000000';
      $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
      $scope.displayedAbbreviation = tx.currency_str;
    } else {
      $http.get("/v1/property/"+tx.currencyId.replace(new RegExp("^0+"), "") +".json", function(data) {
        var property = data[0];
        if(property.propertyType == "0001"){
          $scope.divisible =false;
          $scope.sendPlaceholderValue = $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '1';
        } else  {
          $scope.divisible = true;
          $scope.sendPlaceholderValue = '1.00000000';
          $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
        }
          
        $scope.displayedAbbreviation = property.propertyName + " #" + property.currencyId;
      });
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
      //var successData = successData.data;
      if (successData.status != 200 && successData.status != "OK") { /* Backwards compatibility for mastercoin-tools send API */
      //if (successData.status != 'OK') {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        $modalScope.error = 'Error preparing buy transaction: ' + successData.error || successData.data; /* Backwards compatibility for mastercoin-tools send API */
      } else {
        //var successData = successData.data ??
        //var sourceScript = successData.sourceScript;
        //var unsignedTransaction = successData.transaction;
        var unsignedTransaction = successData.unsignedhex || successData.transaction; /* Backwards compatibility for mastercoin-tools send API */

        try {

          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          var script = parseScript(successData.sourceScript);

          //transaction.ins[0].script = script;
          transaction.ins.forEach(function(input) {
            input.script = script;
          });

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
    var dustValue = 5757;
    var minerMinimum = 10000;
    var nonZeroValue = 1;
    var divisible = $scope.divisible; 

    var convertToSatoshi = [
        $scope.minerFees,
        $scope.buyAmount,
        $scope.balanceData[0], 
        $scope.balanceData[1]
      ];

    if (!divisible) {
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.buyAmount ) ];
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
    }

    var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

    var minerFees = +convertedValues[0];
    var buyAmount = divisible ? +convertedValues[1] : +$scope.buyAmount;
    
    var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
    var btcbalance = +convertedValues[3];

    var coin = $scope.selectedCoin;
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
    if (coin == 'Bitcoin') {
      error += 'make sure your sale is for MSC or TMSC, ';
    }
    if( ((coin == 'Mastercoin') || (coin == 'Test Mastercoin')) ) {
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
        controller: function($scope, $modalInstance, $rootScope, userService, data, prepareBuyTransaction, getUnsignedBuyTransaction, convertSatoshiToDisplayedValue) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=convertSatoshiToDisplayedValue,
          $scope.displayedAbbreviation=data.displayedAbbreviation,
          $scope.buyAmount=data.amt,
          $scope.minerFees= data.fee,
          $scope.selectedCoin= data.selectedCoin;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            prepareBuyTransaction(data.buyer, data.amt, data.hash, data.fee, $scope.privKeyPass, $scope);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
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
              displayedAbbreviation: $scope.displayedAbbreviation
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

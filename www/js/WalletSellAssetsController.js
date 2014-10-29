function WalletSellAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {


  // [ Template Initialization ]

  if ($scope.isCancel == true) {
    $scope.activeCurrencyPair=['BTC','BTC']; // set defaults for Cancel
  }

  $scope.currencySaleList = $scope.currencyList.filter(function(currency){
    if (currency.symbol == $scope.activeCurrencyPair[1] )
      $scope.$parent.$parent.selectedCoin = currency;
    return currency.symbol == $scope.activeCurrencyPair[1];
  });

  if( $scope.currencySaleList.length == 0 ) {
    var noCurrency={
        symbol: 'No DeX-tradable coins in wallet!',
        name: 'No DeX-tradable coins in wallet!',
        addresses: [] 
    }
    $scope.currencySaleList.push(noCurrency);
    $scope.$parent.$parent.selectedCoin=noCurrency;
    $scope.hideForm=true
  }
  // [ Sale Form Helpers ]

  function getUnsignedSaleTransaction(sellerAddress, pubKey, saleAmount, salePrice, buyersFee, fee, saleBlocks, currency) {
    var deferred = $q.defer();

    var url = '/v1/exchange/sell/';
    $http.post(url, {
        seller: sellerAddress,
        pubKey: pubKey,
        amount: saleAmount,
        price: salePrice,
        min_buyer_fee: buyersFee,
        fee: fee,
        blocks: saleBlocks,
        currency: currency
      }).success(function(data) {
        return deferred.resolve(data);
      }).error(function(data) {
      return deferred.reject(data);
    });

    return deferred.promise;
  }

  function prepareSaleTransaction(seller, amt, price, buyerfee, fee, blocks, currency, privkeyphrase, $modalScope) {
    var addressData = userService.getAddress(seller);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.sendTxPromise = getUnsignedSaleTransaction(seller, pubKey, amt, price, buyerfee, fee, blocks, currency);
    $scope.sendTxPromise.then(function(successData) {
      //var successData = successData.data;
      if (successData.status != 200 && successData.status != "OK") { /* Backwards compatibility for mastercoin-tools send API */
      //if (successData.status != 'OK') {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        //$modalScope.error = 'Error preparing sell transaction: ' + successData;
        $modalScope.error = 'Error preparing transaction: ' + successData.error || successData.data; /* Backwards compatibility for mastercoin-tools send API */
      } else {
        //var successData = successData.data ???
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
              $modalScope.url = 'http://blockchain.info/address/' + seller + '?sort=0';
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

  $scope.validateSaleForm = function() {
    var dustValue = 5757;
    var minerMinimum = 10000;
    var nonZeroValue = 1;
    var cancelFees = (5757*3);
    var divisible = $scope.selectedCoin.divisible; 

    var convertToSatoshi = [
        $scope.minerFees,
        $scope.buyersFee,
        0, //$scope.salePricePerCoin,
        $scope.saleAmount,
        $scope.balanceData[0], 
        $scope.balanceData[1]
      ];

    if (!divisible) {
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.saleAmount ) ];
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
    }

    var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

    var minerFees = +convertedValues[0];
    var buyersFee = +convertedValues[1];
    //var salePricePerCoin = +convertedValues[2];
    var saleAmount = divisible ? +convertedValues[3] : +$scope.saleAmount;
    
    var balance = divisible ? +convertedValues[4] : +$scope.balanceData[0];
    var btcbalance = +convertedValues[5];

    var coin = $scope.isCancel != true ? $scope.selectedCoin.symbol : $scope.selectedCoin_extra;
    var salePricePerCoin = $scope.salePricePerCoin;
    var address = $scope.selectedAddress;
    var saleBlocks = +$scope.saleBlocks;

    var totalFeeCost = parseFloat($scope.convertDisplayedValue($scope.totalCost));
    
    var required = [coin, address, saleAmount, saleBlocks, salePricePerCoin, minerFees, buyersFee, balance, btcbalance, $scope.saleForm.$valid];
    
    var error = 'Please ';
    if ($scope.saleForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if ( $scope.isCancel != true && coin == 'BTC') {
      error += 'make sure your sale is for MSC or TMSC, ';
    }
    if( $scope.isCancel != true && ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (saleAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (buyersFee < minerMinimum)
        error += 'make sure your buyers fee entry is at least 0.0001 BTC, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC, ';
      if ((saleAmount <= balance) == false)
        error += 'make sure you aren\'t putting more coins up for sale than you own, ';
      if ((totalFeeCost <= btcbalance) == false)
        error += 'make sure you have enough Bitcoin to cover your fees, ';

      if (saleBlocks < 1)
        error += 'make sure your block timeframe is at least 1, ';
    }
    if ($scope.isCancel == true && (((cancelFees + minerFees) <= btcbalance) == false) )
      error += 'make sure you have enough Bitcoin to cover your transaction fees, ';
    if (error.length < 8) {
      $scope.$parent.showErrors = false;

      // open modal
      var modalInstance = $modal.open({
        templateUrl: $scope.isCancel == true ? '/partials/wallet_cancel_modal.html' : '/partials/wallet_sale_modal.html',
        controller: function($scope, $modalInstance, $rootScope, userService, data, prepareSaleTransaction, getUnsignedSaleTransaction, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=getDisplayedAbbreviation,
          $scope.saleAmount=data.amt,
          $scope.buyersFee=data.buyersfee,
          $scope.selectedCoin=data.selectedCoin,
          $scope.salePricePerCoin= data.price,
          $scope.saleBlocks = data.blocks;

          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;

            prepareSaleTransaction(data.seller, data.amt, data.price,
            data.buyersfee, data.fee, data.blocks, data.currency, $scope.privKeyPass, $scope);
          };
          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        },
        resolve: {
          data: function() {
            return {
              seller: address,
              amt: saleAmount,
              price: salePricePerCoin,
              buyersfee: buyersFee,
              fee: totalFeeCost,
              blocks: saleBlocks,
              currency: coin,
              selectedCoin: $scope.selectedCoin,
              saleBlocks: saleBlocks
            };
          },
          prepareSaleTransaction: function() {
            return prepareSaleTransaction;
          },
          getUnsignedSaleTransaction: function() {
            return getUnsignedSaleTransaction;
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

      modalInstance.result.then(function() {
        if ($scope.isCancel)
          $scope.$parent.$parent.$parent.cancelTrig = null;
      }, function() {
        if ($scope.isCancel)
          $scope.$parent.$parent.$parent.cancelTrig = null;
      });

    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.$parent.showErrors = true;
    }
  };
}


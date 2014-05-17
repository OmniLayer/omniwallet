function WalletSellAssetsController($modal, $scope, $http, $q, userService, walletTradeService) {


  // [ Template Initialization ]

  $scope.currencySaleList = $scope.currencyList.filter(function(currency){
    if (currency.symbol == $scope.activeCurrencyPair[1] )
      $scope.$parent.selectedCoin = currency;
    return currency.symbol == $scope.activeCurrencyPair[1];
  });

  
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
      if (successData.status != 'OK') {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        $modalScope.error = 'Error preparing sell transaction: ' + successData;
      } else {
        //var successData = successData.data ???
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

          walletTradeService.pushSignedTransaction(finalTransaction).then(function(successData) {
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

  $scope.validateSaleForm = function(currencyUnit) {
    var dustValue = 5430;
    var minerMinimum = 10000;
    var nonZeroValue = 1;

    // var salePricePerCoin = Math.ceil( formatCurrencyInFundamentalUnit( +$scope.salePricePerCoin , currencyUnit[3]+'tos'  ) );
    var salePricePerCoin = +$scope.salePricePerCoin;
    var buyersFee = Math.ceil(formatCurrencyInFundamentalUnit(+$scope.buyersFee, currencyUnit[3] + 'tos'));
    var minerFees = Math.ceil(formatCurrencyInFundamentalUnit(+$scope.minerFees, currencyUnit[3] + 'tos'));
    var saleAmount = Math.ceil(formatCurrencyInFundamentalUnit(+$scope.saleAmount, currencyUnit[3] + 'tos'));

    // var salePricePerCoinMillis = formatCurrencyInFundamentalUnit( salePricePerCoin , 'stom' ) ;
    var buyersFeeMillis = formatCurrencyInFundamentalUnit(buyersFee, 'stom');
    var minerFeesMillis = formatCurrencyInFundamentalUnit(minerFees, 'stom');
    var saleAmountMillis = formatCurrencyInFundamentalUnit(saleAmount, 'stom');

    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    var saleBlocks = +$scope.saleBlocks;

    var balance = +$scope.balanceData[0];
    var btcbalance = +$scope.balanceData[1];

    var required = [coin, address, saleAmount, saleBlocks, salePricePerCoin, minerFees, buyersFee, balance, btcbalance, $scope.saleForm.$valid];
    console.log(required);
    var error = 'Please ';
    if ($scope.saleForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if (coin == 'BTC') {
      error += 'make sure your sale is for MSC or TMSC, ';
    }
    if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (saleAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (buyersFee < minerMinimum)
        error += 'make sure your buyers fee entry is at least 0.1 mBTC, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.1 mBTC, ';
      if ((saleAmount <= balance) == false)
        error += 'make sure you aren\'t putting more coins up for sale than you own, ';
      if ((minerFees <= btcbalance) == false)
        error += 'make sure you have enough Bitcoin to cover your fees, ';

      if (saleBlocks < 1)
        error += 'make sure your block timeframe is at least 1, ';
    }
    if (error.length < 8) {
      $scope.$parent.showErrors = false;

      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/wallet_sale_modal.html',
        controller: function($scope, $rootScope, userService, data, prepareSaleTransaction, getUnsignedSaleTransaction) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.saleAmountMillis= data.saleAmountMillis,
          $scope.selectedCoin=data.selectedCoin,
          $scope.salePricePerCoin= data.price,
          $scope.buyersFeeMillis= data.buyersFeeMillis;

          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;

            prepareSaleTransaction(data.seller, data.amt, data.price,
            data.buyerfee, data.fee, data.blocks, data.currency, $scope.privKeyPass, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              seller: address,
              amt: saleAmount,
              price: salePricePerCoin,
              buyerfee: buyersFee,
              fee: minerFees,
              blocks: saleBlocks,
              currency: coin,
              saleAmountMillis: saleAmountMillis,
              selectedCoin: $scope.selectedCoin,
              buyersFeeMillis: buyersFeeMillis
            };
          },
          prepareSaleTransaction: function() {
            return prepareSaleTransaction;
          },
          getUnsignedSaleTransaction: function() {
            return getUnsignedSaleTransaction;
          },
          pushSignedTransaction: function() {
            return walletTradeService.pushSignedTransaction;
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


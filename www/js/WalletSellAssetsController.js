function WalletSellAssetsController($modal, $scope, $http, $q, userService) {
  // [ Form Validation]

  $scope.showErrors = false;

  // [ Template Initialization ]

  $scope.currencyList = userService.getCurrencies(); // [{symbol: 'BTC', addresses:[], name: 'BTC'}, {symbol: 'MSC', addresses:[], name: 'MSC'}, {symbol: 'TMSC', addresses:[], name: 'TMSC'}]
  $scope.currencySaleList = [{
      symbol: 'MSC',
      addresses: [],
      name: 'MSC'
    }];
  $scope.selectedCoin = $scope.currencyList[0];
  $scope.currencyList.forEach(function(e, i) {
    if (e.symbol == "MSC")
      $scope.selectedCoin = e;
  });

  $scope.addressList = getAddressesWithPrivkey();
  $scope.selectedAddress = $scope.addressList[0];

  $scope.$watch('selectedCoin', function() {
    $scope.addressList = getAddressesWithPrivkey();
    $scope.selectedAddress = $scope.addressList[0];
    $scope.setBalance();
  });

  function getAddressesWithPrivkey() {
    var addresses = [];
    userService.getAllAddresses().map(function(e, i, a) {
      if (e.privkey && e.privkey.length == 58) {
        addresses.push(e.address);
      }
    }
    );
    if (addresses.length == 0)
      addresses = ['Could not find any addresses with attached private keys!']
    else {
      addresses.map(function(e, i, a) {
        if ($scope.selectedCoin.addresses.indexOf(e) == -1)
          addresses.splice(i, 1);
      }
      );
      if (addresses.length == 0)
        addresses = ['You have no addresses with a balance on the selected coin!'];
    }
    return addresses;
  }

  // [ Retrieve Balances ]
  $scope.currencyUnit = 'stom'; // satoshi to millibitt
  $scope.amountUnit = 'mtow';
  $scope.balanceData = [0];
  var addrListBal = [];

  $scope.setBalance = function() {
    $scope.balanceData = [0];
    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    if (address || coin) {
      for (var i = 0; i < addrListBal.length; i++) {
        if (addrListBal[i].address == address) {
          for (var k = 0; k < addrListBal[i].balance.length; k++) {
            if (addrListBal[i].balance[k].symbol == coin) {
              $scope.balanceData[0] = addrListBal[i].balance[k].value;
              //console.log($scope.address, coin, $scope.balanceData, addrListBal[i].balance[k], k)
            }
            if (addrListBal[i].balance[k].symbol == 'BTC') {
              $scope.balanceData[1] = addrListBal[i].balance[k].value;
            }
          }
        }
      }
    }
  };

  $scope.addressList.forEach(function(e, i) {
    var promise = getAddressData(e);
    promise.then(function(successData) {
      var successData = successData.data;
      addrListBal[i] = {
        address: e,
        balance: successData.balance
      };
      $scope.setBalance();
    }, function(errorData) {
      alert("We have encountered a problem accessing the server ... Please try again in a few minutes");
      //console.log('Error, no balance data found for ' + e + ' setting defaults...');
      var balances = [
        {
          symbol: 'MSC',
          value: '0'
        },
        {
          symbol: 'TMSC',
          value: '0'
        },
        {
          symbol: 'BTC',
          value: '0'
        }];
      addrListBal[i] = {
        address: e,
        balance: balances
      };
    });
  });

  // [ Helper Functions ]

  function validAddress(addr) {
    try {
      var checkValid = new Bitcoin.Address(addr);
      return true;
    } catch (e) {
      return false;
    }
  }

  function getAddressData(address) {
    console.log('Addr request 5');
    var promise = $http.post('/v1/address/addr/', {
      'addr': address
    });

    return promise;
  }

  function pushSignedTransaction(signedTransaction) {
    var url = '/v1/transaction/pushtx/';
    var data = {
      signedTransaction: signedTransaction
    };
    var promise = $http.post(url, data);
    return promise;
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

          pushSignedTransaction(finalTransaction).then(function(successData) {
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
              $modalScope.error = 'Server error: ' + errorData.message
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
        $modalScope.error = 'Server error: ' + errorData.message
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
      $scope.showErrors = false;

      // open modal
      var modalInstance = $modal.open({
        template: '\
          <div class="modal-body">\
              <h3 class="text-center"> Confirm sale order </h3>\
              <h3>You\'re about to put ' + saleAmountMillis + 'm' + $scope.selectedCoin.symbol +
                        ' on sale at a price of ' + salePricePerCoin + ' BTC per ' + $scope.selectedCoin.symbol +
                ', plus charge ' + buyersFeeMillis + ' in fees over ' +
            $scope.saleBlocks + ' blocks.</h3>\
            <p><br>\
            If the above is correct, please press Send Funds.\
            If you encounter an error, feel free to click away from the dialog and try again.\
            </p>\
          </div>\
          <div class="modal-footer">\
              <div class="row">\
              <button ng-disabled="clicked" class="btn btn-primary" ng-click="ok()">Yes, create this sale</button>\
              <img class="" src="/assets/img/34-1.gif" ng-show="waiting">\
              </div>\
                <br>\
              <div class="row">\
                <div ng-show="sendSuccess">\
                  <h4 class="pull-right col-xs-12" style="color:green"> Sale created successfully, \
                  check your transaction <a target="_blank" href="{{url}}">here.</a></h4>\
                </div>\
                <div ng-show="sendError">\
                  <h4 class="col-xs-12" style="color:red;"> Sale not created: \
                   {{error}} </h4>\
                </div>\
              </div>\
          </div>\
        ',
        controller: function($scope, $rootScope, userService, data, prepareSaleTransaction, getUnsignedSaleTransaction) {
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
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
              currency: coin
            };
          },
          prepareSaleTransaction: function() {
            return prepareSaleTransaction;
          },
          getUnsignedSaleTransaction: function() {
            return getUnsignedSaleTransaction;
          },
          pushSignedTransaction: function() {
            return pushSignedTransaction;
          }
        }
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.showErrors = true;
    }
  };
}


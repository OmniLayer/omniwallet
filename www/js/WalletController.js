
function WalletController($scope, $q, $http, $modal, userService) {
  console.log(userService.getAllAddresses());

  $scope.addrList = userService.getAllAddresses().map(function(e,i,a) { return e.address; })
  $scope.addrListBal = []
  $scope.maxCurrencies = [];
  $scope.totals = {}
  $scope.currentView = userService.getAllAddresses().length == 0 ? "welcome.html" : "overview.html";

  $scope.addrList.forEach(function(e,index) {
     $scope.totalsPromise = getData(e);
     $scope.totalsPromise.then(function(successData) {
        $scope.addrListBal[index] = { address: e, balance: successData.balance }
        
        if(successData.balance.length > 0)
          $scope.maxCurrencies= successData.balance

        for(var i = 0; i < successData.balance.length; i++) {
          var symbolTotal = $scope.totals[successData.balance[i].symbol]
//          console.log(symbolTotal, successData.balance[i].symbol)
          if( ! symbolTotal  )
            $scope.totals[successData.balance[i].symbol] = 0
          $scope.totals[successData.balance[i].symbol] += +successData.balance[i].value
        }
        //console.log($scope)
     },function(errorData) {
        console.log('Error, no balance data found for ' + e + ' using dummy object....');
        var balances = [ ];
        $scope.currentView = "overview.html";
        $scope.addrListBal[index] = { address: e, balance: balances }

        for(var i = 0; i < balances.length; i++) {
          var symbolTotal = $scope.totals[balances[i].symbol]
//          console.log(symbolTotal, successData.balance[i].symbol)
          if( ! symbolTotal  )
            $scope.totals[balances[i].symbol] = 0
          $scope.totals[balances[i].symbol] += +balances[i].value
        }

     });
  });

  $scope.openCreateAddressModal = function() {
    $modal.open({
      templateUrl: 'partials/create_address_modal.html',
      controller: CreateAddressController
    });
  }

  $scope.backupWallet = function() {
    console.log(userService.data.wallet);
    var blob = {
      addresses: userService.data.wallet.addresses
    };
    var exportBlob = new Blob([JSON.stringify(blob)], {type: 'application/json;charset=utf-8'});
    saveAs(exportBlob, "wallet.json");
  }

  function getData(address) {
    var deferred = $q.defer();

    $http.post( '/v1/address/addr/', { 'addr': address } )
    .success( function( data ) {
        return deferred.resolve(data);
    }).error(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }

}

function CreateAddressController($scope, $location, $modalInstance, userService) {
  $scope.createAddress = function(create) {
    var ecKey = new Bitcoin.ECKey();
    var address = ecKey.getBitcoinAddress().toString();
    var encryptedPrivateKey = ecKey.getEncryptedFormat(create.password);
    userService.addAddress(address, encryptedPrivateKey);
    $modalInstance.close();
    $location.path('/wallet/overview');
  }
}

function WalletHistoryController($scope, $http, userService) {
  $scope.selectedAddress = userService.getAllAddresses()[0].address
  $scope.addresses = userService.getAllAddresses()

  $scope.getData = function getData(address) {

    $http.post( '/v1/address/addr/', { 'addr': address } )
      .success( function(data, status, headers, config) {

        $scope.address = data.address;

        delete data.address;
        delete data.balance;
        
        var transaction_data = []
        angular.forEach(data[0], function(msc_tx, tx_type ) {
          if( msc_tx instanceof Array && msc_tx.length != 0 ) {
            //DEBUG console.log(tx_type, msc_tx);
            transaction_data = transaction_data.concat(msc_tx);
          }
        });
        
        angular.forEach(data[1], function(tmsc_tx, tx_type) {
          if( tmsc_tx instanceof Array && tmsc_tx.length != 0 ) {
            //DEBUG console.log(tx_type, tmsc_tx);
            transaction_data = transaction_data.concat(tmsc_tx);
          }
        });

        //sort by date, ascending
        transaction_data = transaction_data.sort(function(a,b) {
            return b.tx_time - a.tx_time;
        });
        
        angular.forEach(transaction_data, function(transaction, index) {
          //DEBUG console.log(new Date(Number(transaction.tx_time)))
          transaction_data[index].tx_hash = transaction.tx_hash.substring(0,22) + '...'
        });
        
        $scope.history = transaction_data;
      });
  }
}

function WalletSendController($modal, $scope, $http, $q, userService) {
  //fee tooltip
  $('#fee-tooltip').tooltip({ 
    title: 'Broadcast Fee: 0.0001 BTC + Dust Fees: 0.00006*4 = 0.00024 Total: 0.00034', 
    placement: 'left' });
  
  $scope.toAddress = ''
 // $scope.isValid = ''

  //a way to add the model to our scope
  $scope.addToScope = function(prop) { }

  //keep errors hidden until user clicks send
  $scope.showErrors = false 

  $scope.validateForm = function() {
    var required = [$scope.coin,$scope.address,$scope.sendAmount,$scope.sendTo].map(
      function(val) {
        return angular.isDefined(val);
      });
    
    var error = 'Please '
    if( required.indexOf(false) != -1) {
       error += 'fill out all given fields, '
    }
    if(( (+$scope.sendAmount + 0.00034) < +$scope.balanceData[0]) == false) {
       error += 'make sure your send amount plus fees isn\'t more than the available count, '
    }
    if( ($scope.coin == 'BTC') &&  (+$scope.sendAmount) < 0.0000543 ) {
       error += 'make sure your send amount is at least 0.00006 (54.3 uBTC minimum) if sending BTC, '
    }
    if( ( ($scope.coin == 'MSC') || ($scope.coin == 'TMSC') ) && +$scope.sendAmount < 0.00000001 ) {
       error += 'make sure your send amount is non-zero, '
    }
    if( validAddress($scope.sendTo) == false) {
       error += 'make sure you are sending to a valid MSC/BTC address, '
    }
    if( error.length < 8) {
      $scope.showErrors = false
      //sendTransaction($scope.sendTo,$scope.address, $scope.sendAmount, $scope.coin, 0.00034)
      
      // open modal
      var modalInstance = $modal.open({
        template: '\
          <div class="modal-body">\
              <h3 class="text-center"> Confirm send </h3>\
              <h3>You\'re about to send ' + (+$scope.sendAmount).toFixed(4) + ' ' +  
              $scope.coin + ' plus fees to ' + $scope.sendTo + '</h3>\
            <p><br>\
            If the above is correct, please input your passphrase below and press Send Funds.\
            If you encounter an error, feel free to click away from the dialog and try again.\
            </p>\
          <input type="password" name=privkey ng-model="privKeyPass.pass" class="form-control"\
            placeholder="enter your private key passphrase">\
          </div>\
          <div class="modal-footer">\
              <div class="row">\
              <button ng-disabled="clicked" class="btn btn-primary" ng-click="ok()">Yes, send my funds</button>\
              <img class="" src="/assets/img/34-1.gif" ng-show="waiting">\
              </div>\
                <br>\
              <div class="row">\
                <div ng-show="sendSuccess">\
                  <h4 class="pull-right col-xs-12" style="color:green"> Funds were sent successfully, \
                  check your transaction <a target="_blank" href="{{url}}">here.</a></h4>\
                </div>\
                <div ng-show="sendError">\
                  <h4 class="col-xs-12" style="color:red;"> Funds could not be sent: \
                   {{error}} </h4>\
                </div>\
              </div>\
          </div>\
        ',
        controller: function($scope,$rootScope, userService, data, sendTransaction, getUnsignedTransaction){
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            sendTransaction(data.sendTo, data.sendFrom, data.amt, data.coin,data.fee, $scope.privKeyPass, $scope);
          }
        },
        resolve: {
          data:function(){ 
            return {  
              sendTo: $scope.sendTo, 
              sendFrom: $scope.address, 
              amt: $scope.sendAmount,
              coin: $scope.coin, 
              fee: 0.00034 } 
          },
          sendTransaction: function() { 
            return sendTransaction; 
          },
          getUnsignedTransaction: function() {
            return getUnsignedTransaction; 
          },
          sendSignedTransaction: function() {
            return sendSignedTransaction;
          }
        }
      });
    } else {
      error += 'and try again.'
      $scope.error = error
      $scope.showErrors = true
    }
  }

  function validAddress(addr) {
    try{
      var checkValid = new Bitcoin.Address(addr);
      return true
    } catch(e) { 
      return false
    }
  }

  $scope.currList = ['MSC', 'TMSC', 'BTC']
  $scope.addrList = getAddressesWithPrivkey()

  function getAddressesWithPrivkey() {
    var addresses = []
    userService.getAllAddresses().map(
      function(e,i,a) { 
        if(e.privkey && e.privkey.length == 58) {
          addresses.push(e.address);
        }
      }
    );
    if( addresses.length == 0)
      addresses = ['Could not find any addresses with attached private keys!'] 
    return addresses
  }

  $scope.balanceData = ['  -- ']
  var addrListBal = []

  $scope.setCoin = function(coin) {
    $scope.coin = coin;
    if ($scope.address) {
      for(var i = 0; i < addrListBal.length; i++) {
        if( addrListBal[i].address == $scope.address) { 
          for(var k = 0; k < addrListBal[i].balance.length; k++) {
            if(addrListBal[i].balance[k].symbol == coin) {
              $scope.balanceData[0] = addrListBal[i].balance[k].value
              //console.log($scope.address, coin, $scope.balanceData, addrListBal[i].balance[k], k)
            }
          }
        }
      }
    }
   }
  $scope.setAddress = function(address) { 
    $scope.address = address
    if ($scope.coin) {
      for(var i = 0; i < addrListBal.length; i++) {
        if( addrListBal[i].address == address) {
          for(var k = 0; k < addrListBal[i].balance.length; k++) {
            if(addrListBal[i].balance[k].symbol == $scope.coin) {
              $scope.balanceData[0] = addrListBal[i].balance[k].value
              //console.log($scope.address, $scope.coin, $scope.balanceData, addrListBal[i].balance[k], k)
            }
          }
        }
      }
    }
   }

  $scope.addrList.forEach(function(e,i) {
     var promise = getData(e);
     promise.then(function(successData) {
        addrListBal[i] = { address: e, balance: successData.balance }
     },function(errorData) {
       console.log('Error, no balance data found for ' + e + ' setting defaults...');
       var balances = [ 
          { symbol: 'MSC', value: '0.0' },
          { symbol: 'TMSC', value: '0.0' },
          { symbol: 'BTC', value: '0.0' } ]
       addrListBal[i] = { address: e, balance: balances }
     });
  });

  function getData(address) {
    var deferred = $q.defer();

    $http.post( '/v1/address/addr/', { 'addr': addr.address },
    function( data ) {
        return deferred.resolve(data);
    }).fail(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }

  function sendTransaction(to, from, amt, currency, fee, privkeyphrase, $modalScope) {
    $scope.sendTxPromise = getUnsignedTransaction(to, from, amt, currency, fee);
    $scope.sendTxPromise.then(function(successData) {
      var sourceScript = successData.sourceScript;
      var unsignedTransaction = successData.transaction

      var addressData; userService.getAllAddresses().forEach(function(e,i) { if(e.address == from) addressData = e; });
      try {
        var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey,privkeyphrase.pass)

        var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction)
        var transaction = Bitcoin.Transaction.deserialize(bytes)
        var script = parseScript(successData.sourceScript)
        
        transaction.ins[0].script = script
        
        //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()))
        var signedSuccess = transaction.signWithKey(privKey)

        var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize())
        
        //Showing the user the transaction hash doesn't work right now
        //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse())

        sendSignedTransaction(finalTransaction).then(function(successData) {
          if( successData.pushed.match(/submitted|success/gi) != null ) {
            $modalScope.waiting = false
            $modalScope.sendSuccess = true
            $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
          } else {
            $modalScope.waiting = false
            $modalScope.sendError = true
            $modalScope.error = successData.pushed  //Unspecified error, show user
          }
          console.log('server response: ',successData);
        },function(errorData) {
          $modalScope.waiting = false
          $modalScope.sendError = true
          $modalScope.error = 'Could not communicate with server, try again'
          console.log('server error: ',errorData);
        });

        //DEBUG console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );
        function parseScript (script) {
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
      } catch(e) {
        $modalScope.sendError = true
        $modalScope.error = 'Private key was incorrect'
        console.log('wrong private key',e)
      }
    },function(errorData) {
      $modalScope.sendError = true
      $modalScope.error = 'Could not communicate with server, try again'
      console.log('server error: ', errorData);
    });
  }

  function getUnsignedTransaction(toAddress,fromAddress, amount, currency, fee) {
    var deferred = $q.defer();

    var url = '/v1/transaction/send/'; 
    $http.post( url, { 
      from_address: fromAddress, 
      to_address: toAddress, 
      amount: amount, 
      currency: currency, 
      fee: fee 
    } ).success(function(data) {
        return deferred.resolve(data);
    }).error(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }

  function sendSignedTransaction(signedTransaction) {
    var deferred = $q.defer();

    var url = '/v1/transaction/pushtx/'; 
    $http.post( url, { 
      signedTransaction: signedTransaction, 
    } ).success(function(data) {
        return deferred.resolve(data);
    }).error(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }
}


function WalletTradeController($scope, $http, $q, userService) {

  $scope.onTradeView = true
  $scope.history = '/partials/wallet_history.html';

  $scope.setView = function(view) {
    if( view != 'tradeInfo')
      $scope.onTradeView = false
    else
      $scope.onTradeView = true
    $scope.tradeView = $scope.tradeTemplates[view]
  }

  $scope.tradeTemplates = {
        'tradeInfo': '/partials/wallet_info.html',
        'simpleSend':'/partials/wallet_send.html',
        'buyOffer': '/partials/wallet_buy.html',
        'saleOffer': '/partials/wallet_sale.html'
  };


}

function WalletTradeHistoryController($scope, $http, $q, userService) {
  $scope.selectedAddress = userService.getAllAddresses()[0].address;
  $scope.addresses = userService.getAllAddresses();
  $scope.pairs = getPairs()
  $scope.currPair = $scope.pairs[0] //TMSC-to-BTC

  function getPairs() {
    return ['TMSC/BTC', 'MSC/BTC'] 
  }

  $scope.getData = function getData(address) {
    var postData = { 
      type: 'ADDRESS',
      address: address, 
      currencyType: $scope.currPair.split('/')[0],   
      offerType: 'BOTH'      
    };
    $http.post('/v1/exchange/offers', postData).success(
      function(offerSuccess) {
        var type_offer = Object.keys(offerSuccess.data);
        var transaction_data = []

        angular.forEach(type_offer, function(offerType) {
         //DEBUG console.log(offerType, offerSuccess.data[offerType])
         angular.forEach(offerSuccess.data[offerType], function(offer) {
          transaction_data.push(offer)
         })
        })

        if(transaction_data.length == 0)
          transaction_data.push({ tx_hash: 'No offers/bids found for this pair/address, why not make one?' })
        $scope.orderbook = transaction_data;
      }
    );
  }

}

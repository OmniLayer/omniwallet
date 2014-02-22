
function WalletController($scope, $q, $http, userService) {
  console.log('initialized wallet')

  userService.addAddress( "19P5uCRuqzzi5SDT8Rq6NrNb9dPJNAScjD", "NOPE!" );
  userService.addAddress( "1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW", "NOPE!" );
  userService.addAddress( "1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P", "NOPE!" );

  $scope.addrList = userService.data.addresses.map(function(e,i,a) { return e.address; })
  $scope.addrListBal = []
  $scope.maxCurrencies = [];
  $scope.totals = {}

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
        console.log('err', errorData);
     });
  });

  function getData(address) {
    var deferred = $q.defer();

    var file = '/v1/address/addr/' + address + '.json'; 
    $http.get( file, {} ).success(function(data) {
        return deferred.resolve(data);
    }).error(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }

}

function WalletHistoryController($scope, $http, userService) {
  console.log('initialized wallet history')

  $scope.first = userService.data.addresses[0].address
  $scope.addresses = userService.data.addresses

  $scope.getData = function getData(address) {

    var file = '/v1/address/addr/' + address + '.json'; 
    $http.get( file, {} ).success(
      function(data, status, headers, config) {

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
  console.log('initialized wallet')
  //fee tooltip
  $('#fee-tooltip').tooltip({ 
    title: 'Broadcast Fee: 0.0001 BTC + Dust Fees: 0.00006*4 = 0.00024 Total: 0.00034', 
    placement: 'left' });
  
  $scope.toAddress = ''
 // $scope.isValid = ''

  //a way to add the model to our scope
  $scope.addToScope = function(prop) { }




  $scope.validateForm = function() {
    var required = [$scope.coin,$scope.address,$scope.sendAmount,$scope.sendTo].map(
      function(val) {
        return angular.isDefined(val);
      });
    
    var error = ''
    if( required.indexOf(false) != -1) {
       error += 'please fill out all the required fields, '
    }
    if(( (+$scope.sendAmount + 0.00034) < +$scope.balanceData[0]) == false) {
       error += 'make sure your send amount+fees isn\'t more than you own, '
    }
    if( validAddress($scope.sendTo) == false) {
       error += 'make sure you are sending to a valid MSC/BTC address, '
    }
    if( error.length == 0) {
      console.log('everything looks ok')
      //sendTransaction($scope.sendTo,$scope.address, $scope.sendAmount, $scope.coin, 0.00034)
      
      // open modal
      var modalInstance = $modal.open({
        template: '\
          <div class="modal-header">\
              <h3> Confirm send </h3>\
          </div>\
          <div class="modal-body">\
              <h3>You\'re about to send ' + (+$scope.sendAmount).toFixed(4) + ' ' +  
              $scope.coin + ' plus fees to ' + $scope.address + '</h3>\
            <p>\
            If the above is correct, please input your passphrase below and press Send Funds.\
            </p>\
          <input type="text" name=privkey ng-model="privKeyPass.pass" class="form-control"\
            placeholder="enter your private key passphrase">\
          </div>\
          <div class="modal-footer">\
              <div class="row">\
              <div ng-show="sendSuccess"> Funds Sent! </div>\
              <div ng-show="sendError"> Funds could not be sent: {{error}} </div>\
              <button ng-disabled="clicked" class="btn btn-primary" ng-click="ok()">Yes, send my funds</button>\
              <img class="" src="/assets/img/34-1.gif" ng-show="waiting">\
              </div>\
          </div>\
        ',
        controller: function($scope,$rootScope, userService,data, sendTransaction, getUnsignedTransaction){
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            sendTransaction(data.sendTo, data.sendFrom, data.amt, data.coin,data.fee, $scope.privKeyPass);
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
      error += 'and try again'
      console.log(error);
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
  $scope.addrList = userService.data.addresses.map(function(e,i,a) { return e.address; })
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
        console.log('err', errorData);
     });
  });

  function getData(address) {
    var deferred = $q.defer();

    var file = '/v1/address/addr/' + address + '.json'; 
    $http.get( file, {} ).success(function(data) {
        return deferred.resolve(data);
    }).error(function(data) {
        return deferred.reject(data);
    });

    return deferred.promise;
  }

  function sendTransaction(to, from, amt, currency, fee, privkeyphrase) {
    $scope.sendTxPromise = getUnsignedTransaction(to, from, amt, currency, fee);
    $scope.sendTxPromise.then(function(successData) {
      var sourceScript = successData.sourceScript;
      var unsignedTransaction = successData.transaction

      var addressData; userService.data.addresses.forEach(function(e,i) { if(e.address == from) addressData = e; });

      try {
        var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey,privkeyphrase.pass)
      } catch(e) {
         console.log('wrong private key')
      }
      var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction)
      var transaction = Bitcoin.Transaction.deserialize(bytes)
      var script = parseScript(successData.sourceScript)
      
      transaction.ins[0].script = script
      
      console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()))
      var signedSuccess = transaction.signWithKey(privKey)

      var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize())

      sendSignedTransaction(finalTransaction).then(function(successData) {
        console.log(successData);
      },function(errorData) {
        console.log(errorData);
      });

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

      console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );
    },function(errorData) {
      console.log('err', errorData);
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

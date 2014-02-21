
function WalletController($scope, $q, $http, userService) {

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

function WalletSendController($scope, $http, $q, userService) {
  console.log('initialized wallet')
  $('#fee-tooltip').tooltip({ title: 'Broadcast Fee: 0.0001 BTC + Dust Fees: 0.00006*4 = 0.00024 Total: 0.00034', placement: 'left' });
  $scope.toAddress = ''
  $scope.isValid = ''
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
    if( $scope.validAddress($scope.sendTo) == false) {
       error += 'make sure you are sending to a valid MSC/BTC address, '
    }
    if( error.length == 0) {
      console.log('everything looks ok')
    } else {
      error += 'and try again'
      console.log(error);
    }
  }
  $scope.validAddress = function(addr) {
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
              console.log($scope.address, coin, $scope.balanceData, addrListBal[i].balance[k], k)
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
              console.log($scope.address, $scope.coin, $scope.balanceData, addrListBal[i].balance[k], k)
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
}

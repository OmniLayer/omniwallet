
function WalletController(userService) {
  console.log('initialized wallet')

  userService.addAddress( "19P5uCRuqzzi5SDT8Rq6NrNb9dPJNAScjD", "NOPE!" );

  userService.addAddress( "1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW", "NOPE!" );
}

function WalletHistoryController($scope, $http, userService) {
  console.log('initialized wallet history', userService)

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

  $scope.currList = ['MSC', 'TMSC', 'BTC']
  $scope.addrList = userService.data.addresses.map(function(e,i,a) { return e.address; })
  $scope.balanceData = ['23200','232113$USD']
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


function WalletController($scope, $q, $http, userService) {

  $scope.addrList = userService.data.addresses.map(function(e,i,a) { return e.address; })
  $scope.defaultAddress = $scope.addrList[0]
  $scope.addrListBal = []
  $scope.maxCurrencies = [];
  $scope.totals = {}
  $scope.currentView = "welcome.html";

  $scope.addrList.forEach(function(e,index) {
     $scope.totalsPromise = getData(e);
     $scope.totalsPromise.then(function(successData) {
        $scope.currentView = "overview.html";
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
        console.log('Error, no balance data found for ' + e + ' setting defaults...');
        var balances = [ 
          { symbol: 'MSC', value: '0.0' },
          { symbol: 'TMSC', value: '0.0' },
          { symbol: 'BTC', value: '0.0' } ];
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
  $scope.selectedAddress = userService.data.addresses[0].address
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
  $scope.selectedAddress = userService.data.addresses[0].address
  $scope.addresses = userService.data.addresses
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

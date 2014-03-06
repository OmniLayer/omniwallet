angular.module( 'omniwallet' )
  .filter( 'cryptocurrency', [
    function() {
      return function( item ) {
        return formatCurrencyInFundamentalUnit( item.balance, item.symbol );
      }
    }
] );
var conversionFactor = {
  'BTC': 100000,
  'MSC': 100000000,
  'TMSC': 100000000
};
function getConversionFactor( symbol ) {
  return conversionFactor[ symbol ];
}
function formatCurrencyInFundamentalUnit( balance, symbol ) {
  if( symbol == 'BTC' )
    return ( balance / conversionFactor.BTC ) + ' mBTC';
  else if( symbol == 'MSC' || symbol == 'TMSC' )
    return ( balance / conversionFactor[ symbol ] ) + ' ' + symbol;
  else
    return balance + ' ' + symbol;
}
function convertToFundamentalUnit( value, symbol ) {
  if( typeof value != 'number' )
    return;

    return Math.round( value * conversionFactor[ symbol ] );
}

function WalletController($scope, $q, $http, $modal, userService) {
  $scope.uuid = userService.getUUID();
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
      templateUrl: '/partials/create_address_modal.html',
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
    var transaction_data = []
    var postData = { 
      type: 'ADDRESS',
      address: address, 
      currencyType: $scope.currPair.split('/')[0],   
      offerType: 'BOTH'      
    };
    $http.post('/v1/exchange/offers', postData).success(
      function(offerSuccess) {
        if(offerSuccess.data != "ADDRESS_NOT_FOUND") {
        var type_offer = Object.keys(offerSuccess.data);

        angular.forEach(type_offer, function(offerType) {
         //DEBUG console.log(offerType, offerSuccess.data[offerType])
         angular.forEach(offerSuccess.data[offerType], function(offer) {
          transaction_data.push(offer)
         })
        })
      } else transaction_data.push({ tx_hash: 'No offers/bids found for this pair/address, why not make one?' })
      $scope.orderbook = transaction_data;
      }
    );
  }

}

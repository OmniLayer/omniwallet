

function WalletController($scope, $q, $http, $modal, $location, userService) {
  $scope.uuid = userService.getUUID();
  $scope.loginLink = $location.protocol() + "://" + $location.host() + "/login/"+ $scope.uuid;
  console.log(userService.getAllAddresses());

  $scope.addrList = userService.getAllAddresses().map(function(e,i,a) { return e.address; })
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
        alert("We have encountered a problem accessing the server ... Please try again in a few minutes")
        //console.log('Error, no balance data found for ' + e + ' using dummy object....');
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
  
  $scope.disclaimerSeen = userService.data.disclaimerSeen;
  $scope.$on('$locationChangeSuccess',function(path){
    userService.data.disclaimerSeen = true;
  });
  
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

function WalletHistoryController($scope, $q, $http, userService, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
  //$scope.selectedAddress = userService.getAllAddresses()[0].address;
  $scope.addresses = userService.getAllAddresses();

  $scope.getAllData = function getAllData() {
    var transaction_data = [];
    var promises = [];
  
    angular.forEach($scope.addresses, function(addrObject) {
      promises.push($http.post( '/v1/address/addr/', { 'addr': addrObject.address } )
          .success( function(data, status, headers, config) {
            delete data.address;
            delete data.balance;
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
          })
      );
    });

    $q.all(promises).then(function () {
      transaction_data = transaction_data.sort(function(a,b) {
        return b.tx_time - a.tx_time;
      });
        
      angular.forEach(transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0,22) + '...'
      });
        
      $scope.history = transaction_data;
    });
  }

  $scope.getData = function getData(address) {
    
    if (!address) {
      $scope.getAllData();
      return;
    }

    console.log( 'Addr request 4' );
    $http.post( '/v1/address/addr/', { 'addr': address } )
      .success( function(data, status, headers, config) {

        $scope.address = data.address;

        delete data.address;
        delete data.balance;
        
        var transaction_data = [];
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
          transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0,22) + '...'
        });
        
        $scope.history = transaction_data;
      });
  }
}

function WalletTradeController($scope, $http, $q, userService) {

  //init and use global to pass data around
  $scope.global = {
    getData: function() {}
  }

  $scope.onTradeView = true
  $scope.history = '/partials/wallet_history.html';

  $scope.setView = function(view, data) {
    if( view != 'tradeInfo')
      $scope.onTradeView = false
    else
      $scope.onTradeView = true
    $scope.tradeView = $scope.tradeTemplates[view]

    $scope.global[view] = data;
  }

  $scope.tradeTemplates = {
        'tradeInfo': '/partials/wallet_info.html',
        'simpleSend':'/partials/wallet_send.html',
        'buyOffer': '/partials/wallet_buy.html',
        'saleOffer': '/partials/wallet_sale.html'
  };

  //initialize the data used in the template
  $scope.currAcronyms = { 'BTC': 'Bitcoin', 'MSC': 'Mastercoin', 'TMSC': 'Test Mastercoin' }
  $scope.currPairs = [ ['BTC', 'MSC'] , ['BTC' , 'TMSC'] ];
  
  //Get the active currency pair
  $scope.activeCurrencyPair = []
  
  $scope.setActiveCurrencyPair = function(currencyPair) {
    //DEBUG console.log(currencyPair);
    if(!currencyPair)
      $scope.activeCurrencyPair = $scope.currPairs[0]
    else
      $scope.activeCurrencyPair = currencyPair
  
    $scope.global.getData();
  }
  $scope.isActiveCurrencyPair = function(currencyPair) {
    if( angular.equals(currencyPair, $scope.activeCurrencyPair) ) 
      return { 'active': 1 }
    else
      return { 'active': 0 }
  }
}

function WalletTradeOverviewController($scope, $http, $q, userService, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
  $scope.currencyUnit = 'stom'
  $scope.selectedTimeframe = "604800"
  $scope.global.getData = function(time, currency) {
    $scope.orderbook = []
    var transaction_data = []
    var postData = { 
      type: 'TIME',
      currencyType: currency || $scope.activeCurrencyPair[1],
      time: time || $scope.selectedTimeframe 
    };
    $http.post('/v1/exchange/offers', postData).success(
      function(offerSuccess) {
        if(offerSuccess.data.length > 0) {
          transaction_data = offerSuccess.data
          //DEBUG console.log(transaction_data)
          //turn everything to number value
          transaction_data.forEach(function(tx) { 
            transaction_data_keys = Object.keys(tx); 
            transaction_data_keys.forEach(function(key) { 
              if( (typeof tx[key] === 'string') && (tx[key].search(/[a-zA-Z]/g) === -1) ) {
                 tx[key] = +tx[key]
              } 
            });
          });

          transaction_data.forEach(function(tx) { 
            transaction_data_keys = ['formatted_amount','formatted_amount_available',
              'formatted_bitcoin_amount_desired','formatted_fee_required','formatted_price_per_coin'];
            transaction_data_keys.forEach(function(key) { 
                  tx[key] = formatCurrencyInFundamentalUnit( tx[key], 'wtos')
              }); 
          });
          transaction_data.sort(function(a,b) { return a.formatted_price_per_coin - b.formatted_price_per_coin }); // sort cheapest; sort most recent (b.tx_time - a.tx_time)
          //DEBUG console.log('wallet trade overview ctrl', transaction_data)
        } else transaction_data.push({ tx_hash: 'No offers/bids found for this timeframe' })
      $scope.orderbook = transaction_data;
      }
    );
  }
}

function WalletTradeHistoryController($scope, $http, $q, userService, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
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
      address: JSON.stringify([address]), 
      currencyType: $scope.currPair.split('/')[0],   
      offerType: 'BOTH'      
    };
    $http.post('/v1/exchange/offers', postData).success(
      function(offerSuccess) {
        if(offerSuccess.data != "ADDRESS_NOT_FOUND") {
          var dataLength = 0; Object.keys(offerSuccess.data).forEach(function(e,i,a) { dataLength += offerSuccess.data[e].length; })
          if(dataLength != 0) {
            var type_offer = Object.keys(offerSuccess.data);

            angular.forEach(type_offer, function(offerType) {
              //DEBUG console.log(offerType, offerSuccess.data[offerType])
              angular.forEach(offerSuccess.data[offerType], function(offer) {
                transaction_data.push(offer)
              });
            })
          }  else transaction_data.push({ tx_hash: 'No offers/bids found for this pair/address, why not make one?' })
        } else transaction_data.push({ tx_hash: 'No offers/bids found for this pair/address, why not make one?' })
      $scope.orderbook = transaction_data;
      }
    );
  }

}


function WalletTradePendingController($scope, $http, $q, userService, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
  //$scope.selectedAddress = userService.getAllAddresses()[ userService.getAllAddresses().length-1 ].address;
  $scope.currencyUnit = 'stom'
  $scope.pendingThinking = true
  $scope.hasAddressesWithPrivkey = getAddressesWithPrivkey()
  $scope.selectedCoin = 'BTC'
  $scope.selectedTimeframe="604800"
  $scope.filterData = function(time) {
      var orderbook = JSON.parse($scope.orderBookStorage);
      
      var now = Date.now()
      var filtered_transaction_data = orderbook.filter(function(item) {
        console.log('time2', +item.tx_time, '>= ?',  (now - (+time) ))
        return true //(+item.tx_time) <= (now - (+time) ) 
      });
      $scope.orderbook = filtered_transaction_data;
  }
  $scope.getData = function(time) {
    $scope.orderbook = []
    var transaction_data = []
    var postData = { 
      type: 'ADDRESS',
      currencyType: 'BOTH',
      address: JSON.stringify($scope.hasAddressesWithPrivkey),
      offerType: 'BOTH'
    };
    $http.post('/v1/exchange/offers', postData).success(
      function(offerSuccess) { console.log(offerSuccess,' ofsec');
        
        //capture data
        var nestedData = offerSuccess.data, nestedLevels = 0, capturedData = [];
        while( typeof nestedData == 'object' && nestedLevels < 5 ) {
          var savedData = []
          if( nestedData instanceof Object && !(nestedData instanceof Array) ) { //DEBUG console.log('got obj', nestedData);
             var data_keys = Object.keys(nestedData)
             data_keys.forEach(function(key) { 
                savedData = savedData.concat(nestedData[key])
             });
          }
          if (nestedData instanceof Array) {  //DEBUG console.log('got arr', nestedData);
              var arrayOfObjects = []
              nestedData.forEach(function(elem) {
                if( elem instanceof Array || !(elem instanceof Object) )
                  capturedData.push(elem)
                else
                  if( elem instanceof Object && !(elem instanceof Array) ) { //DEBUG console.log('got obj', elem);
                    var elem_keys = Object.keys(elem)
                    elem_keys.forEach(function(key) { //DEBUG console.log('got item', typeof elem[key])
                        if(typeof elem[key] == 'object' && key != 'invalid') 
                          arrayOfObjects = arrayOfObjects.concat(elem[key])
                    });
                    //DEBUG console.log('check len', arrayOfObjects.length)
                    if( arrayOfObjects.length == 0)
                      capturedData.push(elem)
                  } 
              });                   
              savedData = arrayOfObjects
          }
          //console.log('nesteddata orig', nestedData, 'data saved', savedData)
          nestedData = savedData
          nestedLevels++
        }

        transaction_data = capturedData;
        transaction_data.forEach(function(tx) {
          if(tx != "ADDRESS_NOT_FOUND") {
            transaction_data_keys = ['formatted_amount','formatted_amount_available',
              'formatted_bitcoin_amount_desired','formatted_fee_required','formatted_price_per_coin', 'bitcoin_required'];
            transaction_data_keys.forEach(function(key) { 
                  tx[key] = formatCurrencyInFundamentalUnit( tx[key], 'wtos')
            });
          } 
        });

        var filtered_transaction_data = transaction_data.filter(function(item) {
          //console.log('stf', item, typeof item != 'string', 'inv', item.invalid == false && item.invalid.length == undefined) 
          return (typeof item == 'object' && (item.invalid == false && item.invalid.length == undefined )) 
         });

        //DEBUG console.log(filtered_transaction_data, 'tettst')
        //DEBUG console.log('filtered tx data, pending offers',filtered_transaction_data)

        $scope.filtered_buys = filtered_transaction_data.filter(function(item) {
          var orderType = item.tx_type_str.toLowerCase()
          var orderStatus = item.status ? item.status.toLowerCase() : undefined;
          //DEBUG console.log(item.tx_type_str, item.status, orderStatus)
          return ( orderType == 'sell accept') && ( orderStatus != 'expired') && (orderStatus != 'closed')
        });

        $scope.filtered_sells = filtered_transaction_data.filter(function(item) {
          var orderType = item.tx_type_str.toLowerCase()
          var orderStatus = item.color.match(/expired/gi) || []
          //DEBUG console.log(orderStatus, item.color)
          return ( orderType == 'sell offer') && ( orderStatus.length == 0) 
        });

        transaction_data = filtered_transaction_data
        //if null, then append simple message
        $scope.orderbook = transaction_data.length != 0 ? transaction_data : [{ tx_hash: 'No offers/bids found for this timeframe' }];
        
        //store around for filtering
        $scope.orderBookStorage = JSON.stringify($scope.orderbook); 
      }
    );
  }
  $scope.purchaseCoin = function(tx) { 
    $scope.pendingThinking = false;
    $scope.buyTransaction = tx
    $scope.sendTo = tx.to_address
    $scope.sendAmountPlaceholder = tx.bitcoin_required
    $scope.selectedAddress = tx.from_address
  }


  function getAddressesWithPrivkey() {
    var addresses = []
    userService.getAllAddresses().map(
      function(e,i,a) { 
        if(e.privkey && e.privkey.length == 58) {
          addresses.push(e.address);
        }
      }
    );
    return addresses
  }
}


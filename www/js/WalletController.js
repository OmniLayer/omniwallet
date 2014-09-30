

function WalletController($scope, $q, $http, $modal, $location, userService) {
  $scope.uuid = userService.getUUID();
  $scope.loginLink = $location.protocol() + "://" + $location.host() + "/login/" + $scope.uuid;
  //console.log(userService.getAllAddresses());

  $scope.addrList = userService.getAllAddresses().map(function(e, i, a) {
    return e.address;
  })
  $scope.addrListBal = []
  $scope.maxCurrencies = [];
  $scope.totals = {}

  $scope.addrList.forEach(function(e, index) {
    $scope.totalsPromise = getData(e);
    $scope.totalsPromise.then(function(successData) {
      $scope.addrListBal[index] = {
        address: e,
        balance: successData.balance
      }

      if (successData.balance.length > 0)
        $scope.maxCurrencies = successData.balance

      for (var i = 0; i < successData.balance.length; i++) {
        var symbolTotal = $scope.totals[successData.balance[i].symbol]
        //          console.log(symbolTotal, successData.balance[i].symbol)
        if (!symbolTotal)
          $scope.totals[successData.balance[i].symbol] = 0
        $scope.totals[successData.balance[i].symbol] += +successData.balance[i].value
      }
      //console.log($scope)
    }, function(errorData) {
      alert("We have encountered a problem accessing the server ... Please try again in a few minutes")
      //console.log('Error, no balance data found for ' + e + ' using dummy object....');
      var balances = [];
      $scope.currentView = "overview.html";
      $scope.addrListBal[index] = {
        address: e,
        balance: balances
      }

      for (var i = 0; i < balances.length; i++) {
        var symbolTotal = $scope.totals[balances[i].symbol]
        //          console.log(symbolTotal, successData.balance[i].symbol)
        if (!symbolTotal)
          $scope.totals[balances[i].symbol] = 0
        $scope.totals[balances[i].symbol] += +balances[i].value
      }

    });
  });

  $scope.disclaimerSeen = userService.data.disclaimerSeen;
  $scope.$on('$locationChangeSuccess', function(path) {
    userService.data.disclaimerSeen = true;
  });

  function getData(address) {
    var deferred = $q.defer();

    $http.post('/v1/address/addr/', {
        'addr': address
      })
      .success(function(data) {
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
    $scope.isLoading = "True";


    angular.forEach($scope.addresses, function(addrObject) {
      promises.push($http.post('/v1/transaction/address', {
        'addr': addrObject.address
      })
      .success(function(data, status, headers, config) {
        delete data.address;
        delete data.balance;

        var keys = Object.keys(data);

        angular.forEach(keys, function(tx_type) {
          tx_data = data[ tx_type ];
          angular.forEach( data[ tx_type ], function( tx_a, idx ) {
            if (tx_a instanceof Array && tx_a.length != 0) {
              //DEBUG console.log(tx_type, msc_tx);
              transaction_data = transaction_data.concat(tx_a);
            }
          });
        });
      })
      );
    });

    $q.all(promises).then(function() {
      transaction_data = transaction_data.sort(function(a, b) {
        return b.tx_time - a.tx_time;
      });

      angular.forEach(transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'

        if(transaction.currency_str == 'Smart Property' && transaction.propertyName != undefined) 
          transaction.currency_str = transaction.propertyName;
        if(transaction.currency_str == undefined)
          transaction.currency_str = transaction.icon_text;
        if(transaction.tx_type_str == undefined)
          transaction.tx_type_str = transaction.icon_text;

        var addresses = $scope.addresses.map(function(addrO) { return addrO.address; });
        var incoming = addresses.indexOf(transaction.to_address);

        if(incoming == -1 && transaction.to_address.length > 32)
          transaction.color = 'info';
        if(incoming != -1 && transaction.to_address.length > 32)
          transaction.color = 'success';
        if(transaction.to_address.length < 32)
          transaction.color = 'warning';

        //DEBUG console.log(incoming, 'inc', transaction.to_address, 'hash', transaction.tx_hash, 'color', transaction.color)
      });

      var hashes = [];
      var clone = transaction_data.slice(0);
      transaction_data.forEach(function(tx,idx) { 
        var foundHash = hashes.indexOf( tx.tx_hash );

        if( foundHash === -1 ) { 
          hashes.push(tx.tx_hash);
        } 
        else {
          //console.log('found dup', tx.tx_hash, idx);
          delete transaction_data[idx];
        }
      });

      $scope.history = transaction_data;
      $scope.isLoading = "False";
    });
  }

  $scope.getData = function getData(address) {

    if (!address) {
      $scope.getAllData();
      return;
    }
    $scope.isLoading = "True";

    console.log('Addr request 4');
    $http.post('/v1/transaction/address', {
        'addr': address
      })
      .success(function(data, status, headers, config) {

      $scope.address = data.address;

      delete data.address;
      delete data.balance;

      var transaction_data = [];
      var keys = Object.keys(data);

      angular.forEach(keys, function(tx_type) {
        tx_data = data[ tx_type ];
        angular.forEach( data[ tx_type ], function( tx_a, idx ) {
          if (tx_a instanceof Array && tx_a.length != 0) {
            //DEBUG console.log(tx_type, msc_tx);
            transaction_data = transaction_data.concat(tx_a);
          }
        });
      });

      //sort by date, ascending
      transaction_data = transaction_data.sort(function(a, b) {
        return b.tx_time - a.tx_time;
      });

      angular.forEach(transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'

        if(transaction.currency_str == 'Smart Property' && transaction.propertyName != undefined) 
          transaction.currency_str = transaction.propertyName;
        if(transaction.currency_str == undefined)
          transaction.currency_str = transaction.icon_text;
        if(transaction.tx_type_str == undefined)
          transaction.tx_type_str = transaction.icon_text;

        var addresses = $scope.addresses.map(function(addrO) { return addrO.address; });
        var incoming = addresses.indexOf(transaction.to_address);

        if(incoming == -1 && transaction.to_address.length > 32)
          transaction.color = 'info';
        if(incoming != -1 && transaction.to_address.length > 32)
          transaction.color = 'success';
        if(transaction.to_address.length < 32)
          transaction.color = 'warning';

        //DEBUG console.log(incoming, 'inc', transaction.to_address, 'hash', transaction.tx_hash, 'color', transaction.color)
      });

      var hashes = [];
      var clone = transaction_data.slice(0);
      transaction_data.forEach(function(tx,idx) { 
        var foundHash = hashes.indexOf( tx.tx_hash );

        if( foundHash === -1 ) { 
          hashes.push(tx.tx_hash);
        } 
        else {
          //console.log('found dup', tx.tx_hash, idx);
          delete transaction_data[idx];
        }
      });

      $scope.history = transaction_data;
      $scope.isLoading = "False";
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
    if (view != 'tradeInfo'){
      if (view == 'saleOffer') {
        if ($scope.hasCoins) {
          $scope.onSaleView = true;
          $scope.saleView = $scope.tradeTemplates[view];
          $scope.onTradeView = false;
        }
        else
        {
          $scope.showNoCoinAlert = true;
        }
      }
      else
      {
        $scope.tradeView = $scope.tradeTemplates[view];
        $scope.onSaleView = false;
        $scope.onTradeView = false;
        $scope.showNoCoinAlert = false;
      }
    }
    else
    {
      $scope.tradeView = $scope.tradeTemplates[view];
      $scope.onTradeView = true;
      $scope.onSaleView = false;
      $scope.showNoCoinAlert = false;
    }
    $scope.global[view] = data;
  }
  $scope.hideNoCoinAlert = function()
  {
    $scope.showNoCoinAlert = false;
  }
  $scope.$on("setView", function(event, args){
    $scope.setView(args.view,args.data);
  });
  
  $scope.setHasCoins = function(hideForm)
  {
    $scope.hasCoins = !hideForm;
  }
  $scope.tradeTemplates = {
    'tradeInfo': '/partials/wallet_info.html',
    'simpleSend': '/partials/wallet_send.html',
    'buyOffer': '/partials/wallet_buy.html',
    'saleOffer': '/partials/wallet_sale.html'
  };

  //initialize the data used in the template
  $scope.currAcronyms = {
    'BTC': 'Bitcoin',
    'MSC': 'Mastercoin',
    'TMSC': 'Test Mastercoin'
  }
  $scope.currPairs = [['BTC', 'MSC'], ['BTC', 'TMSC']];

  //Get the active currency pair
  $scope.activeCurrencyPair = []

  $scope.setActiveCurrencyPair = function(currencyPair) {
    //DEBUG console.log(currencyPair);
    if (!currencyPair)
      $scope.activeCurrencyPair = $scope.currPairs[0]
    else
      $scope.activeCurrencyPair = currencyPair

    $scope.global.getData();
    var random = Math.random();
    $scope.saleView = '/partials/wallet_sale.html?r='+random;
    $scope.showNoCoinAlert = false;
  }
  $scope.isActiveCurrencyPair = function(currencyPair) {
    if (angular.equals(currencyPair, $scope.activeCurrencyPair))
      return {
        'active': 1
      }
    else
      return {
        'active': 0
      }
  }
}

function WalletTradeOverviewController($scope, $http, $q, userService, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
  $scope.currencyUnit = 'stom'
  $scope.timeNow = Date.now();
  $scope.timeAll = $scope.timeNow - 1394834400000;
  $scope.timeOptions = [
    {name:'24 Hours', value:'86400'},
    {name:'1 Week', value:'604800'},
    {name:'1 Month', value:'2419200'},
    {name:'3 Month', value:'7257600'},
    {name:'All', value:$scope.timeAll}
  ];  
  $scope.selectedTimeframe = $scope.timeOptions[4].value;
  $scope.global.getData = function(time, currency) {
    $scope.orderbook = []
    var transaction_data = []
    var postData = {
      type: 'TIME',
      currencyType: currency || $scope.activeCurrencyPair[1],
      time: time || $scope.selectedTimeframe
    };
    $http.post('/v1/exchange/offers', postData).success(function(offerSuccess) {
      if (offerSuccess.data.length > 0) {
        transaction_data = offerSuccess.data
        //DEBUG console.log(transaction_data)
        //turn everything to number value
        transaction_data.forEach(function(tx) {
          transaction_data_keys = Object.keys(tx);
          transaction_data_keys.forEach(function(key) {
            if ((typeof tx[key] === 'string') && (tx[key].search(/[a-zA-Z]/g) === -1)) {
              tx[key] = +tx[key]
            }
          });
        });

        transaction_data.forEach(function(tx) {
          transaction_data_keys = ['formatted_amount', 'formatted_amount_available',
            'formatted_bitcoin_amount_desired', 'formatted_fee_required', 'formatted_price_per_coin'];
          transaction_data_keys.forEach(function(key) {
            tx[key] = tx[key];
          });
        });

        transaction_data = transaction_data.filter(function(item) {
           var orderType = item.tx_type_str.toLowerCase()
           var orderStatus = item.color.match(/invalid|expired|done/gi) || []
           //DEBUG console.log(orderStatus, item.color)
           return (orderType == 'sell offer') && (orderStatus.length == 0)
        });

        angular.forEach(transaction_data, function(transaction, index) {
          //DEBUG console.log(new Date(Number(transaction.tx_time)))
          transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'
        });

        transaction_data=transaction_data.filter(function(elem) {
          return (elem.action != 3);
        });

        transaction_data.sort(function(a, b) {
          return a.formatted_price_per_coin - b.formatted_price_per_coin
        }); // sort cheapest; sort most recent (b.tx_time - a.tx_time)
        transaction_data.length == 0 ? transaction_data.push({ tx_hash_concat: 'No offers/bids found for this timeframe', tx_hash: 'No offers/bids found for this timeframe'  }) : transaction_data;
      } else 
          transaction_data.push({ tx_hash_concat: 'No offers/bids found for this timeframe', tx_hash: 'No offers/bids found for this timeframe' })
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
  $scope.hasAddressesWithPrivkey = getAddressesWithPrivkey();
  $scope.selectedAddress = $scope.hasAddressesWithPrivkey[0];
  userService.getCurrencies().filter(function(currency){
       return currency.tradable;
  }).forEach(function(coin){
    if(coin.symbol=='BTC'){
      $scope.selectedCoin = coin;    
    }
  });
  
  //Get All data
  $scope.timeNow = Date.now();
  $scope.selectedTimeframe = $scope.timeNow - 1394834400000;
  //$scope.selectedTimeframe = "604800"
  $scope.filterData = function(time) {
    var orderbook = JSON.parse($scope.orderBookStorage);

    var now = Date.now()
    var filtered_transaction_data = orderbook.filter(function(item) {
      console.log('time2', +item.tx_time, '>= ?', (now - (+time)))
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
    $http.post('/v1/exchange/offers', postData).success(function(offerSuccess) {
      console.log(offerSuccess, ' ofsec');

      //capture data
      var nestedData = offerSuccess.data,
        nestedLevels = 0,
        capturedData = [];
      while (typeof nestedData == 'object' && nestedLevels < 5) {
        var savedData = []
        if (nestedData instanceof Object && !(nestedData instanceof Array)) { //DEBUG console.log('got obj', nestedData);
          var data_keys = Object.keys(nestedData)
          data_keys.forEach(function(key) {
            savedData = savedData.concat(nestedData[key])
          });
        }
        if (nestedData instanceof Array) { //DEBUG console.log('got arr', nestedData);
          var arrayOfObjects = []
          nestedData.forEach(function(elem) {
            if (elem instanceof Array || !(elem instanceof Object))
              capturedData.push(elem) 
            else if (elem instanceof Object && !(elem instanceof Array)) { //DEBUG console.log('got obj', elem);
              var elem_keys = Object.keys(elem)
              elem_keys.forEach(function(key) { //DEBUG console.log('got item', typeof elem[key])
                if (typeof elem[key] == 'object' && key != 'invalid')
                  arrayOfObjects = arrayOfObjects.concat(elem[key])
              });
              //DEBUG console.log('check len', arrayOfObjects.length)
              if (arrayOfObjects.length == 0)
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
        if (tx != "ADDRESS_NOT_FOUND") {
          transaction_data_keys = ['formatted_amount', 'formatted_amount_available',
            'formatted_bitcoin_amount_desired', 'formatted_fee_required', 'formatted_price_per_coin', 'bitcoin_required'];
          transaction_data_keys.forEach(function(key) {
            tx[key] = tx[key];
          });
        }
      });

      var filtered_transaction_data = transaction_data.filter(function(item) {
        //console.log('stf', item, typeof item != 'string', 'inv', item.invalid == false && item.invalid.length == undefined) 
        return (typeof item == 'object' && (item.invalid == false && item.invalid.length == undefined))
      });

      //DEBUG console.log(filtered_transaction_data, 'tettst')
      //DEBUG console.log('filtered tx data, pending offers',filtered_transaction_data)

      $scope.filtered_buys = filtered_transaction_data.filter(function(item) {
        var orderType = item.tx_type_str.toLowerCase()
        var orderStatus = item.status ? item.status.toLowerCase() : undefined;
        //DEBUG console.log(item.tx_type_str, item.status, orderStatus)
        return (orderType == 'sell accept') && (orderStatus != 'expired') && (orderStatus != 'closed')
      });

      $scope.filtered_sells = filtered_transaction_data.filter(function(item) {
        var orderType = item.tx_type_str.toLowerCase()
        var orderStatus = item.color.match(/(done|expired|invalid)/gi) || []
        //DEBUG console.log(orderStatus, item.color)
        return (orderType == 'sell offer') && (orderStatus.length == 0)
      });

      angular.forEach(filtered_transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        filtered_transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...';
      });

      transaction_data = filtered_transaction_data;
      //if null, then append simple message
      $scope.orderbook = transaction_data.length != 0 ? transaction_data : [{
            tx_hash: 'No offers/bids found for this timeframe'
          }];

      //store around for filtering
      $scope.orderBookStorage = JSON.stringify($scope.orderbook);
    }
    );
};
  $scope.purchaseCoin = function(tx) {
    $scope.pendingThinking = false;
    $scope.buyTransaction = tx;
    $scope.sendTo = tx.to_address;
    $scope.sendAmount = tx.bitcoin_required;
    $scope.selectedAddress = tx.from_address;
    $http.get('/v1/transaction/tx/' + tx.sell_offer_txid + '.json').success(function(data) {
      var sell_tx = data[0];
      $http.post('/v1/blocks/getlast',{origin:"blockchain"}).success(function(block){
        $scope.remainingBlocks = sell_tx.formatted_block_time_limit - (block.height - tx.block);
      });
    });
  };

  function getAddressesWithPrivkey() {
    var addresses = [];
    userService.getAllAddresses().map(function(e, i, a) {
      if (e.privkey && e.privkey.length == 58) {
        addresses.push(e.address);
      }
    }
    );
    return addresses;
  }

  $scope.isCancel=true;
  $scope.confirmCancel = function(tx) {
    $scope.selectedAddress = tx.from_address;
    $scope.selectedCoin_extra = (+tx.currencyId) == 1 ? 'MSC' : 'TMSC';
    $scope.cancelTrig=!$scope.cancelTrig;
  }
}



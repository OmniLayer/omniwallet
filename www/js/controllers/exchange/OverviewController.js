angular.module("omniControllers")
	.controller("ExchangeOverviewController",["$scope", "$http", "$q", "hashExplorer", 
		function ExchangeOverviewController($scope, $http, $q, hashExplorer) {
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
  $scope.getData = function(time, currency) {
    $scope.noOrders=false;
    $scope.loading = true;
    $scope.orderbook = [];
    var transaction_data = [];
    var coin = currency || $scope.activeCurrencyPair[1].propertyid == 1 ? 'OMNI' : 'T-OMNI';
    var postData = {
      type: 'TIME',
      currencyType: coin,
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
           var orderStatus = item.color.match(/invalid|expired|bgc-done/gi) || []
           //DEBUG console.log(orderStatus, item.color)
           return (orderType == 'sell offer') && (orderStatus.length == 0)
        });

        angular.forEach(transaction_data, function(transaction, index) {
          //DEBUG console.log(new Date(Number(transaction.tx_time)))
          transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 18) + '...'
        });

        transaction_data=transaction_data.filter(function(elem) {
          return (elem.action != 3);
        });

        transaction_data.sort(function(a, b) {
          return a.formatted_price_per_coin - b.formatted_price_per_coin
        }); // sort cheapest; sort most recent (b.tx_time - a.tx_time)
        transaction_data.length == 0 ? transaction_data.push({ tx_hash_concat: 'No offers/bids found for this timeframe', tx_hash: 'No offers/bids found for this timeframe'  }) : transaction_data;
      } else 
          $scope.noOrders = true;
      $scope.orderbook = transaction_data;
      $scope.loading = false;
    }
    );
  }
}])
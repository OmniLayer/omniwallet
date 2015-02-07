angular.module("omniControllers")
	.controller("ExchangePendingController",["$scope", "$http", "$q", "hashExplorer",
		function ExchangePendingController($scope, $http, $q, hashExplorer) {
		  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
		  //$scope.selectedAddress = $scope.wallet.addresses[ $scope.wallet.addresses.length-1 ].address;
		  $scope.currencyUnit = 'stom'
		  $scope.pendingThinking = true
		  $scope.hasAddressesWithPrivkey = $scope.wallet.addresses.filter(function(address){
		    return address.privkey && address.privkey.length == 58
		  }).map(function(e){
		          return e.address;
		        });
		  $scope.selectedAddress = $scope.hasAddressesWithPrivkey[0];
		  $scope.wallet.assets.filter(function(currency){
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
		        var orderType = item.TRANSACTION.TYPEstr.toLowerCase()
		        var orderStatus = item.status ? item.status.toLowerCase() : undefined;
		        //DEBUG console.log(item.TRANSACTION.TYPEstr, item.status, orderStatus)
		        return (orderType == 'sell accept') && (orderStatus != 'expired') && (orderStatus != 'closed')
		      });

		      $scope.filtered_sells = filtered_transaction_data.filter(function(item) {
		        var orderType = item.TRANSACTION.TYPEstr.toLowerCase()
		        var orderStatus = item.color.match(/(bgc-done|expired|invalid)/gi) || []
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
		    });
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

		  $scope.isCancel=true;
		  $scope.confirmCancel = function(tx) {
		    $scope.selectedAddress = tx.from_address;
		    $scope.selectedCoin_extra = (+tx.currencyId) == 1 ? 'MSC' : 'TMSC';
		    $scope.cancelTrig=!$scope.cancelTrig;
		  }
		}])
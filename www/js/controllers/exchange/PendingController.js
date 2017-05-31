angular.module("omniControllers")
	.controller("ExchangePendingController",["$scope", "$http", "hashExplorer", "ADDRESS_EXPLORER_URL", "Transaction", "SATOSHI_UNIT", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST", "MINER_SPEED", "$filter",
		function ExchangePendingController($scope, $http, hashExplorer, ADDRESS_EXPLORER_URL, Transaction, SATOSHI_UNIT, MIN_MINER_FEE, OMNI_PROTOCOL_COST, MINER_SPEED, $filter) {
		  function checkSend(sendAmount) {
			if($scope.selectedAddress != undefined){
				avail = parseFloat($scope.selectedAddress.getDisplayBalance(0));
				console.log(avail);
				$scope.selectedAddress.estimateFee(sendAmount).then(function(result){
					$scope.feeData=result;
					if($scope.feeType != 'custom'){
						$scope.minersFee = new Big(result.class_c[$scope.feeType]);
						$scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
					}
				});
                  
				if ( avail >= parseFloat(sendAmount) + parseFloat($scope.minersFee) + parseFloat($scope.protocolFee) ) {
					$scope.cansend = true;
				} else {
					$scope.cansend = false;
				}
				console.log($scope.cansend);
			} else {
				$scope.cansend = false;
			}
		  }

		  $scope.protocolFee = new Big(OMNI_PROTOCOL_COST);
		  $scope.feeType = MINER_SPEED;

		  $scope.editTransactionCost = function(){
			$scope.omniAnnounce = false;
			$scope.modalManager.openTransactionCostModal($scope, $scope.sendTransaction);
			checkSend($scope.sendAmount);
		  }

		  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer)
		  //$scope.selectedAddress = $scope.wallet.addresses[ $scope.wallet.addresses.length-1 ].address;
		  $scope.currencyUnit = 'stom'
		  $scope.pendingThinking = true
		  $scope.hasAddressesWithPrivkey = $scope.wallet.addresses.filter(function(address){
		    return (address.privkey && address.privkey.length == 58) || (address.pubkey && address.pubkey.length > 65);
		  }).map(function(e){
		          return e.hash;
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
		        var orderType = item.tx_type_str.toLowerCase()
		        var orderStatus = item.status ? item.status.toLowerCase() : undefined;
		        //DEBUG console.log(item.tx_type_str, item.status, orderStatus)
		        return (orderType == 'sell accept') && (orderStatus != 'expired') && (orderStatus != 'closed')
		      });

		      $scope.filtered_sells = filtered_transaction_data.filter(function(item) {
		        var orderType = item.tx_type_str.toLowerCase()
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
		    $scope.minersFee = MIN_MINER_FEE;
		    $scope.pendingThinking = false;
		    $scope.buyTransaction = tx;
		    $scope.sendTo = tx.to_address;
		    $scope.sendAmount = tx.bitcoin_required;
		    $scope.selectedAddress = $scope.wallet.getAddress(tx.from_address);
		    $scope.selectedAsset = $scope.wallet.getAsset(0);
		    checkSend(tx.bitcoin_required);
		    $http.get('/v1/transaction/tx/' + tx.sell_offer_txid + '.json').success(function(data) {
		      var sell_tx = data[0];
		      //$scope.minersFee= new Big(sell_tx.formatted_fee_required);
		      $http.post('/v1/blocks/getlast',{origin:"blockchain"}).success(function(block){
		        $scope.remainingBlocks = sell_tx.formatted_block_time_limit - (block.height - tx.block);
		      });
		    });
		  };

		  $scope.isCancel=true;
		  $scope.confirmCancel = function(tx) {
		    sendingAddress = $scope.wallet.getAddress(tx.from_address);
		    sendingAddress.estimateFee().then(function(result){
                                        $scope.feeData=result;
                                        if($scope.feeType != 'custom'){
                                                $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                                                $scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
                                        }
					$scope.omniAnnounce = true;
					$scope.buttonOverride = 'COMMON.NEXT';
					$scope.modalManager.openTransactionCostModal($scope, function(){$scope.sendCancel(tx);} );
                                  });
		  };

		  $scope.sendCancel = function(tx) {
			//var fee = new Big(0.0001);
			var fee = $scope.minersFee;
			var exchangeCancel = new Transaction(20,$scope.wallet.getAddress(tx.from_address),fee,{
			  transaction_version:1,
			  amount_for_sale: 0,
			  amount_desired: 0,
			  min_buyer_fee: 0,
			  blocks: 10,
			  currency_identifier: tx.currencyId,
			  action:3,
			  donate: $scope.account.getSetting("donate")
			});

			$scope.modalManager.openConfirmationModal({
			  dataTemplate: '/views/modals/partials/cancel.html',
			  scope:{
			    title:"EXCHANGE.MYOFFERS.CANCELTITLE",
			    confirmText:"EXCHANGE.MYOFFERS.CANCELCONFIRM",
		            explorerUrl:ADDRESS_EXPLORER_URL,
		            successRedirect:"/exchange/myoffers",
			    minersFee: fee
		          },
		          transaction:exchangeCancel
			})
		  };

		  $scope.sendTransaction = function(){
			// TODO: Validations
			var fee = $scope.minersFee;
			var amount = $scope.sendAmount;
			var acceptSend = new Transaction(0,$scope.selectedAddress,fee,{
		        transaction_version:0,
		        currency_identifier:$scope.selectedAsset.id,
		        amount_to_transfer : +new Big(amount).valueOf(),
		        transaction_to: $scope.sendTo,
		        donate: $scope.account.getSetting("donate"),
		        marker: true
		    });
		    
			var btcPrice = $scope.selectedAsset.price;
			
			var modalScope = {
				title:"WALLET.SEND.CONFIRM",
				token:$filter('truncate')($scope.selectedAsset.name,15,0),
				sendAmount:$scope.sendAmount,
				symbol:$scope.selectedAsset.symbol,
				sendValue:$scope.sendAmount * btcPrice,
				toAddress:$scope.sendTo,
				fees:new Big(acceptSend.totalCost).plus(new Big(OMNI_PROTOCOL_COST)).valueOf(),
				confirmText:"WALLET.SEND.FUNDS",
            	successRedirect:"/wallet" 
			};


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/send.html',
				footerTemplate: $scope.selectedAsset.id == 0 ? '/views/modals/partials/send_footer.html' : undefined,
				scope: $scope.selectedAsset.id != 0 ? modalScope : angular.extend(modalScope, {
					btcValueChanged:false,
					bitcoinValue:btcPrice,
					bitcoin:$scope.selectedAsset
				}),
				transaction:acceptSend
			})
		};
		}])

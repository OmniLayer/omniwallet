angular.module("omniControllers")
	.controller("WalletSendController",["$scope", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST", "SATOSHI_UNIT", "Transaction", "$filter", function WalletSendController($scope, MIN_MINER_FEE, PROTOCOL_FEE,SATOSHI_UNIT,Transaction,$filter){
                function checkSend() {
                  avail = parseFloat($scope.selectedAddress.getDisplayBalance(0));
                  console.log(avail);
                  if ( $scope.selectedAsset.symbol == 'BTC' ) {
                    if ( avail >= parseFloat($scope.minersFee) ) {
                      $scope.cansend = true;
                    } else {
                      $scope.cansend = false;
                    }
                  } else {
                    if ( avail >= parseFloat($scope.minersFee) + parseFloat($scope.protocolFee) ) {
                      $scope.cansend = true;
                    } else {
                      $scope.cansend = false;
                    }
                  }
                  console.log($scope.cansend);
                }
		$scope.minersFee = MIN_MINER_FEE;
		$scope.protocolFee = PROTOCOL_FEE;

		$scope.selectedAsset = $scope.wallet.getAsset(1) || $scope.wallet.getAsset(0);
		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];

                checkSend();


      	$scope.showtesteco = $scope.account.getSetting('showtesteco');
      	$scope.userCurrency = $scope.account.getSetting("usercurrency");

      	$scope.setAsset = function(asset){
      		$scope.selectedAsset = asset;
      		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
                checkSend();
      	}
      	
      	$scope.setAddress = function(address){
      		$scope.selectedAddress = address;
                checkSend();
      	}

      	$scope.editTransactionCost = function(){
      		$scope.modalManager.openTransactionCostModal($scope, $scope.sendTransaction);
                checkSend();
      	}

      	$scope.sendTransaction = function(){
			// TODO: Validations
			var fee = $scope.minersFee;
			var amount = $scope.sendByValue ? $scope.sendAmount * $scope.selectedAsset.price : $scope.sendAmount;
			var simpleSend = new Transaction(0,$scope.selectedAddress,fee,{
		        transaction_version:0,
		        currency_identifier:$scope.selectedAsset.id,
		        amount_to_transfer : $scope.selectedAsset.divisible ? +new Big(amount).times(SATOSHI_UNIT).valueOf() : +amount,
		        transaction_to: $scope.sendTo,
		        donate: $scope.account.getSetting("donate"),
		        marker: $scope.marker || false
		    });
		    
			var btcPrice = $scope.selectedAsset.price;
			
			var modalScope = {
				title:"WALLET.SEND.CONFIRM",
				token:$filter('truncate')($scope.selectedAsset.name,15,0),
				sendAmount:$scope.sendAmount,
				symbol:$scope.selectedAsset.symbol,
				sendValue:$scope.sendAmount * btcPrice,
				toAddress:$scope.sendTo,
				fees:simpleSend.totalCost,
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
				transaction:simpleSend
			})
		};

		// transactionGenerationController.validateTransactionData = function(){
		//     var dustValue = 5757;
		//     var minerMinimum = 10000;
		//     var nonZeroValue = 1;
		//     var divisible = $scope.selectedCoin.divisible; 

		//     var convertToSatoshi = [
		//         $scope.minerFees,
		//         $scope.sendAmount,
		//         $scope.balanceData[0], 
		//         $scope.balanceData[1],
		//         $scope.totalCost
		//       ];

		//     if (!divisible) {
		//       delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.sendAmount ) ];
		//       delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
		//     }

		//     var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

		//     var minerFees = +convertedValues[0];
		//     var sendAmount = divisible ? +convertedValues[1] : +$scope.sendAmount;
		//     var totalFeeCost = +convertedValues[4];

		//     var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
		//     var btcbalance = +convertedValues[3];

		//     var coin = $scope.selectedCoin.symbol;
		//     var address = $scope.selectedAddress;
		//     var sendTo = $scope.sendTo;
		//     var marked = $scope.marked;

		//     var required = [coin, address, sendAmount, sendTo, minerFees, totalFeeCost,  balance, btcbalance, $scope.sendForm.$valid, marked];

		//     var error = 'Please ';
		//     if ($scope.sendForm.$valid == false) {
		//       error += 'make sure all fields are completely filled, ';
		//     }
		//     if (coin == 'BTC') {
		//         if ((sendAmount+minerFees <= balance) == false) {
		//         error += 'make sure you aren\'t sending more tokens than you own, ';
		//       }
		//     }
		//     else {
		//         if ((sendAmount <= balance) == false) {
		//         error += 'make sure you aren\'t sending more tokens than you own, ';
		//       }
		//     }
		//     if ((totalFeeCost <= btcbalance) == false) {
		//       error += 'make sure you have enough Bitcoin to cover your transaction costs, ';
		//     }
		//     if (walletTransactionService.validAddress(sendTo) == false) {
		//       error += 'make sure you are sending to a valid MSC/BTC address, ';
		//     }
		//     if (coin == 'BTC') {
		//       if (sendAmount < dustValue)
		//         error += 'make sure your send amount is at least 0.00005757 BTC if sending BTC, ';
		//       if (minerFees < minerMinimum)
		//         error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
		//     }
		//     if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
		//       if (sendAmount < nonZeroValue)
		//         error += 'make sure your send amount is non-zero, ';
		//       if (minerFees < minerMinimum)
		//         error += 'make sure your fee entry is at least 0.0001 BTC, ';
		//     }
		    
		//     return error;
		//   };
	}])

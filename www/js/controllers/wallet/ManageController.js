angular.module("omniControllers")
  .controller("WalletManageController",["$scope", "MIN_MINER_FEE", "MINER_SPEED", "OMNI_PROTOCOL_COST", "SATOSHI_UNIT", "Transaction", "$filter",
      function WalletManageController($scope, MIN_MINER_FEE, MINER_SPEED, PROTOCOL_FEE, SATOSHI_UNIT, Transaction, $filter){

        function checkSend() {
        	if($scope.selectedAddress != undefined){
	          avail = parseFloat($scope.selectedAddress.getDisplayBalance(0));
	          console.log(avail);

                  BTCAmount=0;

                  $scope.selectedAddress.estimateFee(BTCAmount).then(function(result){
                    $scope.feeData=result;
                    if($scope.feeType != 'custom'){
                      $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                      $scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
                    }
                    $scope.updatingFee=false;
                  });

		  if ( avail >= parseFloat($scope.minersFee) + parseFloat($scope.protocolFee) ) {
	            $scope.cansend = true;
	          } else {
	            $scope.cansend = false;
	          }
	          console.log($scope.cansend);
	        } else {
	            $scope.cansend = false;
	        }
        }


	$scope.minersFee = MIN_MINER_FEE;
	$scope.protocolFee = PROTOCOL_FEE;
        $scope.feeType = MINER_SPEED;
	$scope.type = "Grant";
        $scope.type_int = 55;

	$scope.selectedAsset = $scope.wallet.getManagedAsset();
	$scope.selectedAddress = $scope.wallet.getManagedAddress();

        checkSend();


      	$scope.showtesteco = $scope.account.getSetting('showtesteco');
      	$scope.userCurrency = $scope.account.getSetting("usercurrency");

        $scope.updateFee = function(){
                $scope.updatingFee=true;
                $scope.amountModified=false;
                checkSend();

        }

	$scope.setType = function(type){
		if (type === 'Grant') {
			$scope.type = "Grant";
			$scope.type_int = 55;
		} else {
			$scope.type = "Revoke";
			$scope.type_int = 56;
		}
	}

      	$scope.editTransactionCost = function(){
      		$scope.modalManager.openTransactionCostModal($scope, function(){return;});
                checkSend();
      	}

      	$scope.sendTransaction = function(){
			// TODO: Validations
			var fee = $scope.minersFee;
			var amount = $scope.sendAmount;
			var ManageSend = new Transaction($scope.type_int,$scope.selectedAddress,fee,{
			        transaction_version:0,
				currency_identifier:$scope.selectedAsset.id,
			        amount: +new Big(amount).valueOf(),
			        transaction_to: $scope.sendTo,
			        donate: $scope.account.getSetting("donate"),
				marker: $scope.marker || false
			});
		    
			var btcPrice = $scope.selectedAsset.price;
			var displayFee = new Big(fee).plus(new Big(PROTOCOL_FEE)).valueOf();
			
			var modalScope = {
				title: $scope.type_int === 55 ? "Confirm Grant" : "Confirm Revoke",
				token:$filter('truncate')($scope.selectedAsset.name,15,0),
				propertyid: $scope.selectedAsset.id,
				type_int: $scope.type_int,
				sendAmount:$scope.sendAmount,
				symbol:$scope.selectedAsset.symbol,
				sendValue:$scope.sendAmount * btcPrice,
				toAddress:$scope.sendTo,
				fees:displayFee,
				confirmText:"COMMON.BROADCAST",
				successRedirect:"/wallet"
			};


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/manage.html',
				footerTemplate: undefined,
				scope:  modalScope,
				transaction: ManageSend
			})
		};

	}])

angular.module("omniControllers")
	.controller("WalletSendController",["$scope", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST", "SATOSHI_UNIT", "ModalManager", "Transaction", function WalletSendController($scope, MIN_MINER_FEE, PROTOCOL_FEE,SATOSHI_UNIT,ModalManager,Transaction){
		$scope.minersFee = MIN_MINER_FEE;
		$scope.protocolFee = PROTOCOL_FEE;

		$scope.selectedAsset = $scope.wallet.getAsset(1) || $scope.wallet.getAsset(0);
		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];

      	$scope.showtesteco = $scope.account.getSetting('showtesteco');
      	$scope.userCurrency = $scope.account.getSetting("usercurrency");

      	$scope.setAsset = function(asset){
      		$scope.selectedAsset = asset;
      		$scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
      	}
      	$scope.setAddress = function(address){
      		$scope.selectedAddress = address;
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
		        donate: Account.getSetting("donate")
		      });
			ModalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/send.html',
				footerTemplate: '/views/modals/partials/send_footer.html',
				scope: {
					title:"Confirm Send",
					token:$scope.selectedAsset.name,
					sendAmount:$scope.sendAmount,
					symbol:$scope.selectedAsset.symbol,
					sendValue:$scope.sendAmount * $scope.selectedAsset.price,
					toAddress:$scope.sendTo,
					fees:simpleSend.totalCost
				},
				transaction:simpleSend
			})
		};
	}])
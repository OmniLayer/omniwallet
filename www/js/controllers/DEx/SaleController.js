angular.module("omniControllers")
	.controller("DExSaleController", ["$scope","TransactionManager","WalletAssets","ModalManager", 
		function DExSaleController($scope, TransactionManager, WalletAssets, ModalManager ){
			$scope.walletAssets = WalletAssets;

			$scope.DExSaleTransaction = new TransactionManager(21);

			$scope.setSelectedCoin = function(currencyId){
				WalletAssets.currencyList.forEach(function(currency){
					if(currency.id == currencyId.toString())
						WalletAssets.selectedCoin = currency;
				});
			}

			$scope.validateDexSaleForm = function(){
				// TODO: Validations
				ModalManager.openConfirmationModal({
					title:"Confirm DEx Sale",
					dataTemplate: '/views/modals/partials/dex_sale.html',
					scope: {
						address:WalletAssets.selectedAddress,
						saleCurrency:$scope.saleCurrency,
						saleAmount:$scope.saleAmount,
						desiredCurrency:$scope.desiredCurrency,
						desiredAmount:$scope.desiredAmount,
						action:$scope.action,
						totalCost:WalletAssets.totalCost,
						convertSatoshiToDisplayedValue:WalletAssets.convertSatoshiToDisplayedValue
					},
					fromAddress: WalletAssets.selectedAddress,
					confirmText: "Create Sale",
					confirm: function(){
						var data = TransactionManager.prepareData({
							transaction_version:0,
							sale_currency_id:$scope.saleCurrency,
							sale_amount:$scope.saleAmount,
							desired_currency:$scope.desiredCurrency,
							desired_amount:$scope.desiredAmount,
							action:$scope.action,
						},WalletAssets.selectedAddress)

						return TransactionManager.processTransaction(data,WalletAssets.offline)
					}
				})
			};
		}])
angular.module("omniControllers")
	.controller("DExSaleController", ["$scope","TransactionManager","Wallet","ModalManager", 
		function DExSaleController($scope, TransactionManager, Wallet, ModalManager ){
			$scope.walletAssets = Wallet;

			$scope.DExSaleTransaction = new TransactionManager(25,{
						transaction_version:0,
						sale_currency_id:$scope.saleCurrency,
						sale_amount:$scope.saleAmount,
						desired_currency_id:$scope.desiredCurrency,
						desired_amount:$scope.desiredAmount
					});

			
			$scope.validateDexSaleForm = function(){
				// TODO: Validations
				$scope.DExSaleTransaction = new TransactionManager(25,{
						transaction_version:0,
						sale_currency_id:$scope.saleCurrency,
						sale_amount:$scope.saleAmount,
						desired_currency_id:$scope.desiredCurrency,
						desired_amount:$scope.desiredAmount
					});
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_sale.html',
					scope: {
						title:"Confirm DEx Sale",
						address:WalletAssets.selectedAddress,
						saleCurrency:$scope.saleCurrency,
						saleAmount:$scope.saleAmount,
						desiredCurrency:$scope.desiredCurrency,
						desiredAmount:$scope.desiredAmount,
						action:$scope.action,
						totalCost:WalletAssets.totalCost,
						confirmText: "Create Sale"
					},
					transactionManager: $scope.DExSaleTransaction
				})
			};
		}])
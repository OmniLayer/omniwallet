angular.module("omniControllers")
	.controller("DExSaleController", ["$scope", "PropertyManager", "Account", "Transaction", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST", "ModalManager",
		function DExSaleController($scope,PropertyManager,Account,Transaction,MIN_MINER_FEE,PROTOCOL_FEE,ModalManager ){

			$scope.editTransactionCost = function(){
				$scope.modalManager.openTransactionCostModal($scope, function(){return;});
			}

			$scope.feeType = 'normal';
			$scope.protocolFee = PROTOCOL_FEE;
			$scope.setAddress = function(address){
				$scope.selectedAddress = address;
				$scope.setAsset($scope.wallet.getAsset($scope.selectedAddress.assets[0].id));
				$scope.selectedAddress.estimateFee().then(function(result){
					$scope.feeData=result;
					if($scope.feeType != 'custom'){
						$scope.minersFee = new Big(result.class_c[$scope.feeType]);
					}
				});
			};

			$scope.setAsset = function(asset){
				$scope.sellingAsset = asset;
				let nextEco = (asset.id < 2147483648 && asset.id != 2) ? 1 : 2;
				if($scope.ecosystem != nextEco){
					$scope.ecosystem = nextEco;
					$scope.loadCurrencies();	
				}
			}

			$scope.setDesiredAsset = function(asset){
				$scope.desiredAsset = asset;
			}

			$scope.loadCurrencies = function(){
				PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
			      $scope.availableTokens = result.data.properties.sort(function(a, b) {
			          var currencyA = a.name.toUpperCase();
			          var currencyB = b.name.toUpperCase();
			          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
			      });
			      $scope.desiredAsset = $scope.availableTokens[0];
			  	});
			}

			$scope.validateDexSaleForm = function(){
				// TODO: Validations
				var fee = Account.settings.minerFee || $scope.minersFee;
				var dexOffer = new Transaction(25,$scope.selectedAddress,fee,{
						transaction_version:0,
						propertyidforsale:$scope.sellingAsset.id,
						amountforsale: new Big($scope.sellingAmount).valueOf(),
						propertiddesired:$scope.desiredAsset.propertyid,
						amountdesired: new Big($scope.desiredAmount).valueOf()
					});
				let redirectUrl = "/dex/overview";
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_offer.html',
					scope: {
						title:"Confirm DEx Transaction",
						address:$scope.selectedAddress,
						saleCurrency:$scope.sellingAsset.id,
						saleAmount:$scope.sellingAmount,
						desiredCurrency:$scope.desiredAsset.propertyid,
						desiredAmount:$scope.desiredAmount,
						totalCost:dexOffer.totalCost,
						confirmText: "Create Transaction",
						successMessage: "Your order was placed successfully",
						successRedirect:redirectUrl
					},
					transaction:dexOffer
				});

			};

			$scope.setAddress($scope.wallet.omniTradableAddresses()[0])
			$scope.showtesteco = $scope.account.getSetting('showtesteco');
		}])

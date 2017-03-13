angular.module("omniControllers")
	.controller("DExSaleController", ["$scope", "PropertyManager", "Account", "Transaction", "MIN_MINER_FEE", "MINER_SPEED", "OMNI_PROTOCOL_COST", "ModalManager",
		function DExSaleController($scope,PropertyManager,Account,Transaction,MIN_MINER_FEE,MINER_SPEED,PROTOCOL_FEE,ModalManager ){

			$scope.editTransactionCost = function(){
				$scope.modalManager.openTransactionCostModal($scope, function(){return;});
			}

			$scope.omniAnnounce = true;
			$scope.feeType = MINER_SPEED;
			$scope.protocolFee = PROTOCOL_FEE;
			$scope.filteredCur = {'index':-1, 'cur':{'propertyid':-1}};
			$scope.setAddress = function(address){
				$scope.selectedAddress = address;
				if (address!=undefined) {
				  $scope.setAsset($scope.wallet.getAsset($scope.selectedAddress.assets[0].id));
				  $scope.selectedAddress.estimateFee().then(function(result){
					$scope.feeData=result;
					if($scope.feeType != 'custom'){
						$scope.minersFee = new Big(result.class_c[$scope.feeType]);
						$scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
					}
				  });
				}
			};

			$scope.setAsset = function(asset){
				$scope.sellingAsset = asset;
				nextEco = (asset.id < 2147483648 && asset.id != 2) ? 1 : 2;
				if($scope.ecosystem != nextEco){
					$scope.ecosystem = nextEco;
					$scope.loadCurrencies();	
				} else {
					if ($scope.filteredCur['index'] > -1) {
						$scope.availableTokens.splice($scope.filteredCur['index'],0,$scope.filteredCur['cur']);
					}
					self.filterCurrencies();
				}
			}

			$scope.setDesiredAsset = function(asset){
				$scope.desiredAsset = asset;
			}

			self.filterCurrencies = function(){
				index=-1;
				$scope.availableTokens.forEach(function(token) {
					if (token.propertyid==$scope.sellingAsset.propertyid) {
						index=$scope.availableTokens.indexOf(token);
					}
				});
				if (index > -1) {
					$scope.filteredCur={'index':index, 'cur':$scope.availableTokens.splice(index,1)[0]};
				}
				if ($scope.desiredAsset.propertyid==$scope.filteredCur['cur'].propertyid){
					$scope.desiredAsset = $scope.availableTokens[0];
				}
			}

			$scope.loadCurrencies = function(){
				PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
					$scope.availableTokens = result.data.properties.sort(function(a, b) {
						var currencyA = a.name.toUpperCase();
						var currencyB = b.name.toUpperCase();
						return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
					});
					$scope.desiredAsset = $scope.availableTokens[0];
					self.filterCurrencies();
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
				redirectUrl = "/dex/overview";
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_offer.html',
					scope: {
						title:"Confirm OmniDex Transaction",
						address:$scope.selectedAddress,
						saleCurrency:$scope.sellingAsset.id,
						saleName:$scope.sellingAsset.name,
						saleAmount:$scope.sellingAmount,
						desiredCurrency:$scope.desiredAsset.propertyid,
						desiredName:$scope.desiredAsset.name,
						desiredAmount:$scope.desiredAmount,
						totalCost:dexOffer.totalCost,
						confirmText: "Create Transaction",
						successMessage: "Your order was placed successfully",
						invert: false,
						successRedirect:redirectUrl
					},
					transaction:dexOffer
				});

			};

			$scope.setAddress($scope.wallet.omniTradableAddresses()[0])
			$scope.showtesteco = $scope.account.getSetting('showtesteco');
		}])

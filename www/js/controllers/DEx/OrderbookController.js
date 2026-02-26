angular.module("omniControllers")
	.controller("DExOrderbookController", ["$scope","Account","Orderbook","PropertyManager","ModalManager", "Transaction", "MIN_MINER_FEE", "OMNI_PROTOCOL_COST",
		function DExOrderbookController($scope,Account,Orderbook,PropertyManager,ModalManager, Transaction, MIN_MINER_FEE, PROTOCOL_FEE){
			$scope.isLoggedIn = Account.loggedIn;
			$scope.orderbook = {};
			$scope.noOrders = true;
			$scope.protocolFee = PROTOCOL_FEE;
			$scope.omniAnnounce = true;

			$scope.loadOrderbook = function(propertyIdDesired, propertyIdSelling){
				if($scope.orderbook.updateBidsTimeout){
					clearTimeout($scope.orderbook.updateBidsTimeout);
				}
				if($scope.orderbook.updateAsksTimeout){
					clearTimeout($scope.orderbook.updateAsksTimeout);
				}
				PropertyManager.getProperty(propertyIdDesired).then(function(result){
					$scope.propertyDesired = result.data;
					PropertyManager.getProperty(propertyIdSelling).then(function(result){
						$scope.propertySelling = result.data;
						$scope.orderbook = new Orderbook({desired:$scope.propertyDesired,selling:$scope.propertySelling});
						if (Account.loggedIn) {
							$scope.orderbook.setBuyAddress($scope.orderbook.buyAddresses[0]);
							$scope.orderbook.setSellAddress($scope.orderbook.sellAddresses[0]);
						}
					});
				});
			}

			$scope.editTransactionCost = function(side){
				if (side == 'buy') {
					$scope.minersFee=$scope.orderbook.buyOrder.fee;
					$scope.feeType=$scope.orderbook.buyOrder.feeType;
					$scope.feeData=$scope.orderbook.buyOrder.feeData;
				} else {
					$scope.minersFee=$scope.orderbook.sellOrder.fee;
					$scope.feeType=$scope.orderbook.sellOrder.feeType;
					$scope.feeData=$scope.orderbook.sellOrder.feeData;
                                }
				$scope.modalManager.openTransactionCostModal($scope, function(){
					if (side == 'buy') {
						$scope.orderbook.buyOrder.fee=$scope.minersFee;
						$scope.orderbook.buyOrder.feeType=$scope.feeType;
					} else {
						$scope.orderbook.sellOrder.fee=$scope.minersFee;
						$scope.orderbook.sellOrder.feeType=$scope.feeType;
	                                }
                                });
			}

			$scope.confirmCancel = function(offer){
			 	var fee = Account.settings.minerFee || MIN_MINER_FEE;
				var dexOffer = new Transaction(26,offer.ownerAddress,fee,{
						transaction_version:0,
						propertyidforsale:offer.propertyselling.propertyid,
						amountforsale: offer.selling_amount.valueOf(),
						propertiddesired:offer.propertydesired.propertyid,
						amountdesired: offer.total_desired_amount.valueOf()
					});
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_offer.html',
					scope: {
						title:"Cancel OmniDex Offer",
						address:offer.ownerAddress,
						saleCurrency:offer.propertyselling.propertyid,
						saleName:offer.propertyselling.name,
						saleAmount:offer.selling_amount.valueOf(),
						desiredCurrency:offer.propertydesired.propertyid,
						desiredName:offer.propertydesired.name,
						desiredAmount:offer.total_desired_amount.valueOf(),
						totalCost:dexOffer.totalCost,
						confirmText: "Cancel Offer",
						invert: false,
						successMessage: "Your order was cancelled successfully"
					},
					transaction:dexOffer
				});
			}
			$scope.confirmCancelAll = function(address){
			 	var fee = Account.settings.minerFee || MIN_MINER_FEE;
				var dexOffer = new Transaction(27,address,fee,{
						transaction_version:0,
						propertyidforsale:$scope.orderbook.tradingPair.selling.propertyid,
						propertiddesired:$scope.orderbook.tradingPair.desired.propertyid
					});
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_cancel.html',
					scope: {
						title:"Cancel OmniDex Offers By Pair",
						address:address,
						saleCurrency:$scope.orderbook.tradingPair.selling.propertyid,
						desiredCurrency:$scope.orderbook.tradingPair.desired.propertyid,
						totalCost:dexOffer.totalCost,
						confirmText: "Cancel All",
						successMessage: "The offers where cancelled successfully"
					},
					transaction:dexOffer
				});
			}
	}]);

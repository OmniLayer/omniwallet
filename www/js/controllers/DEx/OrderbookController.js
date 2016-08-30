angular.module("omniControllers")
	.controller("DExOrderbookController", ["$scope","Account","Orderbook","PropertyManager","ModalManager", "Transaction", "MIN_MINER_FEE",
		function DExOrderbookController($scope,Account,Orderbook,PropertyManager,ModalManager, Transaction, MIN_MINER_FEE){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbook = {};
			$scope.noOrders = true;

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
					});
				});
			}

			$scope.confirmCancel = function(offer){
			 	var fee = Account.settings.minerFee || MIN_MINER_FEE;
				var dexOffer = new Transaction(26,offer.ownerAddress,fee,{
						transaction_version:0,
						propertyidforsale:offer.propertyselling.propertyid,
						amountforsale: offer.selling_amount.valueOf(),
						propertiddesired:offer.propertydesired.propertyid,
						amountdesired: offer.desired_amount.valueOf()
					});
				ModalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/dex_offer.html',
					scope: {
						title:"Cancel DEx Offer",
						address:offer.ownerAddress,
						saleCurrency:offer.propertyselling.propertyid,
						saleAmount:offer.selling_amount.valueOf(),
						desiredCurrency:offer.propertydesired.propertyid,
						desiredAmount:offer.desired_amount.valueOf(),
						totalCost:dexOffer.totalCost,
						confirmText: "Cancel Offer",
						successMessage: "Your order was cancelled successfully"
					},
					transaction:dexOffer
				});
			}
	}]);
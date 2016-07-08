angular.module("omniControllers")
	.controller("DExOrderbookController", ["$scope","Account","Orderbook","Wallet","PropertyManager","$http","$route",
		function DExOrderbookController($scope,Account,Orderbook,Wallet,PropertyManager,$http,$route){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbook = {};
			$scope.noOrders = true;
			PropertyManager.getProperty($route.current.params.propertyIdDesired).then(function(result){
				$scope.propertyDesired = result.data;
				PropertyManager.getProperty($route.current.params.propertyIdSelling).then(function(result){
					$scope.propertySelling = result.data;
					$scope.orderbook = new Orderbook({desired:$scope.propertyDesired,selling:$scope.propertySelling});
				});
			});

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
						address:offer.address,
						saleCurrency:offer.selling.propertyid,
						saleAmount:offer.amounts.selling,
						desiredCurrency:offer.desired.propertyid,
						desiredAmount:offer.amounts.desired,
						totalCost:dexOffer.totalCost,
						confirmText: "Cancel Offer",
						successMessage: "Your order was cancelled successfully"
					},
					transaction:dexOffer
				});
			 }
	}]);
angular.module("omniControllers")
	.controller("CrowdsaleParticipationController", ["$scope", "SATOSHI_UNIT", "$route", "PropertyManager", "Transaction",
	  function CrowdsaleParticipationController($scope, SATOSHI_UNIT, $route, PropertyManager, Transaction){
		$scope.propertyId = $route.current.params.propertyId;

		// Load and initialize the form
		PropertyManager.getProperty($scope.propertyId).then(function(result){
		    $scope.property = result.data;
		    $scope.propertyDesired = $scope.wallet.getAsset($scope.property.propertyiddesired)
		    $scope.selectedAddress = $scope.propertyDesired.tradableAddresses[0]
		});

		$scope.setAddress = function(address){
			$scope.selectedAddress=address;
		}

		$scope.confirmParticipation = function(){
				var fee = $scope.minerFee;
				var amount = $scope.sendAmount;
				var now = new Date()
				var participation = new Transaction(0,$scope.selectedAddress,fee,{
			        transaction_version:0,
			        currency_identifier:$scope.property.propertyiddesired,
			        amount_to_transfer : amount,
			        transaction_to: $scope.property.issuer,
			        donate: $scope.account.getSetting("donate")
			    });


				$scope.modalManager.openConfirmationModal({
					dataTemplate: '/views/modals/partials/participation.html',
					scope: {
						title:"CROWDSALE_PARTICIPATE_TITLE",
						selectedAsset:$scope.propertyDesired,
						toAddress:$scope.property.issuer,
						fees:participation.totalCost,
						earlybird : ((($scope.property.deadline - (now.getTime()/1000)) / 604800) * $scope.property.earlybonus).toFixed(1),
						tokensperunit: $scope.property.tokensperunit,
						confirmText:"CROWDSALE_PARTICIPATE_CONFIRM"
					},
					transaction:participation
				})
			}
	}])
angular.module("omniControllers")
	.controller("CrowdsaleParticipationController", ["$scope", "SATOSHI_UNIT", "$route", "PropertyManager", "Transaction","$filter",
	  function CrowdsaleParticipationController($scope, SATOSHI_UNIT, $route, PropertyManager, Transaction, $filter){
		$scope.propertyId = $route.current.params.propertyId;
		$scope.property = {};
		$scope.estimatedAmount = 0;

		// Load and initialize the form
		PropertyManager.getProperty($scope.propertyId).then(function(result){
		    $scope.property = result.data;
		    $scope.propertyDesired = $scope.wallet.getAsset($scope.property.propertyiddesired)
		    $scope.selectedAddress = $scope.propertyDesired.tradableAddresses[0];
			
			var now = new Date()
		    $scope.earlybird = ((($scope.property.deadline - (now.getTime()/1000)) / 604800) * $scope.property.earlybonus).toFixed(1);
		});

		$scope.setAddress = function(address){
			$scope.selectedAddress=address;
		}

		$scope.confirmParticipation = function(){
			var fee = new Big($scope.minerFees);
			var amount = $scope.sendAmount;
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
					title:"CROWDSALE.PARTICIPATE.TITLE",
					token:$filter('truncate')($scope.propertyDesired.name,15,0),
					tokenRecieved: $filter('truncate')($scope.property.name,15,0),
					toAddress:$scope.property.issuer,
					fees:participation.totalCost,
					earlybird : $scope.earlybird,
					sendAmount: $scope.sendAmount,
					tokensperunit: $scope.property.tokensperunit,
					confirmText:"CROWDSALE.PARTICIPATE.CONFIRM",
            		successRedirect:"/assets/details/" + $scope.propertyId
				},
				transaction:participation
			})
		}

		$scope.calculateAmount = function(){
			var netValue = ($scope.sendAmount || 0) * $scope.property.tokensperunit;
			$scope.estimatedAmount = netValue  + ($scope.earlybird * netValue / 100);
		}
	}])
angular.module("omniControllers")
	.controller("CrowdsaleParticipationController", ["$scope", "SATOSHI_UNIT",function CrowdsaleParticipationController($scope, SATOSHI_UNIT){
		$scope.setAddress = function(address){
			$scope.selectedAddress=address;
			$scope.transaction.configure(0,address,$scope.minerFees,$scope.transaction.data)
		}

		$scope.$watch("sendAmount", function(amount){
			$scope.transaction.data["amount_to_transfer"] =  $scope.selectedAsset.divisible ? +new Big(amount).times(SATOSHI_UNIT).valueOf() : +amount;
		})
	}])
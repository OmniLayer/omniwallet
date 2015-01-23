angular.module("omniControllers")
	.controller("ConfirmSendFooterController", ["$scope", function($scope){
		$scope.ok = function() {
          if ($scope.bitcoinValue == $scope.bitcoin.price) {
            $scope.clicked = true;
            $scope.waiting = true;
            $scope.confirm();
          }
          else{
            $scope.waiting = false;
            $scope.btcValueChanged = true;
            $scope.newBtcAmount = parseFloat(new Big($scope.sendValue/$scope.bitcoin.price).toFixed(8));
            $scope.newValue = parseFloat(new Big($scope.sendAmount*$scope.bitcoin.price).toFixed(3));
          }
	    };

	    $scope.sendByValue = function(){
	      $scope.sendAmount = $scope.newBtcAmount;
	      $scope.sendAmount = new Big(parseInt($scope.sendAmount)).toFixed(0);
	      data.transactionData.amount_to_transfer = $scope.sendAmount;
	      $scope.sendAmountDisplayed = parseFloat(new Big($scope.convertSatoshiToDisplayedValue($scope.sendAmount)));
	      $scope.btcValueChanged = false;
	      $scope.transactionError = false;
	      $scope.bitcoinValue = $scope.getBitcoinValue();
	      $scope.setBitcoinValue($scope.getBitcoinValue());
	      $scope.changeAmount();
	    };
	    $scope.sendByAmount = function(){
	      var amount = $scope.convertSatoshiToDisplayedValue($scope.sendAmount);
	      $scope.value = new Big(amount*$scope.getBitcoinValue()).toFixed(3);
	      $scope.btcValueChanged = false;
	      $scope.transactionError = false;
	      $scope.bitcoinValue = $scope.getBitcoinValue();
	      $scope.setBitcoinValue($scope.getBitcoinValue());
	      $scope.changeValue();
	    };
	}])
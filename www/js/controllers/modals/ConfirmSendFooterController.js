angular.module("omniControllers")
	.controller("ConfirmSendFooterController", ["$scope", "SATOSHI_UNIT", function($scope, SATOSHI_UNIT){
		$scope.ok = function() {

	        $scope.clicked = true;
	        $scope.waiting = true;
          if ($scope.bitcoinValue == $scope.bitcoin.price) {
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
	      $scope.transaction.data['amount_to_transfer'] = +new Big($scope.newBtcAmount).valueOf();
	      $scope.btcValueChanged = false;
	      $scope.transactionError = false;
	      $scope.clicked = false;
	      $scope.bitcoinValue = $scope.bitcoin.price;
	    };
	    $scope.sendByAmount = function(){
	      $scope.sendValue = $scope.newValue;
	      $scope.btcValueChanged = false;
	      $scope.transactionError = false;
	      $scope.clicked = false;
	      $scope.bitcoinValue = $scope.bitcoin.price;
	    };
	}])
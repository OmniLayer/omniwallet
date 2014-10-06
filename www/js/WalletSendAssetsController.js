WHOLE_UNIT = new Big(0.00000001);
function WalletSendAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {
  $scope.walletAssets =  $scope.$parent.$parent;
  var transactionGenerationController = $scope.$parent;

  $scope.changeValue = function(){
    $scope.value = $scope.sendAmount*$scope.bitcoinValue;
    $scope.value = new Big($scope.value).toFixed(8);
    $scope.value = parseFloat($scope.value);
  }
  $scope.changeAmount = function(){
    $scope.sendAmount = $scope.value/$scope.bitcoinValue;
    $scope.sendAmount = new Big($scope.sendAmount).toFixed(8);
    $scope.sendAmount = parseFloat($scope.sendAmount);
  }
 
  $scope.resetAmountAndValue = function(){
    $scope.sendAmount = 0;
    $scope.value = 0;
  }
 
  transactionGenerationController.validateTransactionData = function(){
    var dustValue = 5757;
    var minerMinimum = 10000;
    var nonZeroValue = 1;
    var divisible = $scope.selectedCoin.divisible; 

    var convertToSatoshi = [
        $scope.minerFees,
        $scope.sendAmount,
        $scope.balanceData[0], 
        $scope.balanceData[1],
        $scope.totalCost
      ];

    if (!divisible) {
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.sendAmount ) ];
      delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
    }

    var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

    var minerFees = +convertedValues[0];
    var sendAmount = divisible ? +convertedValues[1] : +$scope.sendAmount;
    var totalFeeCost = +convertedValues[4];

    var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
    var btcbalance = +convertedValues[3];

    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    var sendTo = $scope.sendTo;
    var marked = $scope.marked;

    var required = [coin, address, sendAmount, sendTo, minerFees, totalFeeCost,  balance, btcbalance, $scope.sendForm.$valid, marked];

    var error = 'Please ';
    if ($scope.sendForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if ((sendAmount <= balance) == false) {
      error += 'make sure you aren\'t sending more tokens than you own, ';
    }
    if ((totalFeeCost <= btcbalance) == false) {
      error += 'make sure you have enough Bitcoin to cover your transaction costs, ';
    }
    if (walletTransactionService.validAddress(sendTo) == false) {
      error += 'make sure you are sending to a valid MSC/BTC address, ';
    }
    if (coin == 'BTC') {
      if (sendAmount < dustValue)
        error += 'make sure your send amount is at least 0.00005757 BTC if sending BTC, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
    }
    if( ((coin == 'MSC') || (coin == 'TMSC')) ) {
      if (sendAmount < nonZeroValue)
        error += 'make sure your send amount is non-zero, ';
      if (minerFees < minerMinimum)
        error += 'make sure your fee entry is at least 0.0001 BTC, ';
    }
    
    return error;
  };
  
  transactionGenerationController.modalTemplateUrl = '/partials/wallet_send_modal.html';
  
  transactionGenerationController.setModalScope = function($modalScope){
    $modalScope.transactionSuccess = false, $modalScope.transactionError = false, $modalScope.waiting = false, $modalScope.privKeyPass = {};
    $modalScope.convertSatoshiToDisplayedValue=  $scope.convertSatoshiToDisplayedValue,
    $modalScope.convertDisplayedValue = $scope.convertDisplayedValue;
    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
    $modalScope.sendAmount=  $scope.selectedCoin.divisible ? +$scope.convertDisplayedValue($scope.sendAmount) : +$scope.sendAmount,
    $modalScope.minerFees= +$scope.convertDisplayedValue($scope.minerFees),
    $modalScope.sendTo= $scope.sendTo;
    $modalScope.sendFrom= $scope.selectedAddress;
    $modalScope.totalCost= +$scope.convertDisplayedValue($scope.totalCost);
    $modalScope.bitcoinValue = $scope.bitcoinValue;
    $modalScope.getBitcoinValue = $scope.getBitcoinValue;
    $modalScope.setBitcoinValue = $scope.setBitcoinValue;
    $modalScope.resetAmountAndValue = $scope.resetAmountAndValue;
    $modalScope.selectedCoinSymbol = $scope.walletAssets.selectedCoin.symbol;
    $modalScope.value = $scope.value;
    $modalScope.btcValueChanged = false;
  };
  

  transactionGenerationController.generateData = function(){
    return {
      from:$scope.selectedAddress,
      transactionType:0,
      transactionData:{
        transaction_version:0,
        transaction_from: $scope.selectedAddress,
        currency_identifier:$scope.selectedCoin.id,
        amount_to_transfer : $scope.selectedCoin.divisible ? +$scope.convertDisplayedValue($scope.sendAmount) : +$scope.sendAmount,
        transaction_to: $scope.sendTo,
        fee: $scope.convertDisplayedValue($scope.minerFees),
        marker: $scope.marked
      }
    }; 
  };


  transactionGenerationController.modalController = function($scope, $modalInstance, data, prepareTransaction, setModalScope, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
    setModalScope($scope);

    $scope.ok = function() {
      if (($scope.bitcoinValue == $scope.getBitcoinValue())||$scope.selectedCoinSymbol != 'BTC') {
        $scope.clicked = true;
        $scope.waiting = true;
        prepareTransaction(data.transactionType, data.transactionData, data.from, $scope);
      }
      else{
        $scope.waiting = false;
        $scope.transactionError = true;
        $scope.error = 'The value of BTC has changed. Please check the send details and retry.';
        $scope.btcValueChanged = true;
      }
    };
   
    $scope.cancel = function () {
      $modalInstance.dismiss('cancel');
    };
    $scope.goBack = function(){
      $scope.setBitcoinValue($scope.getBitcoinValue());
      $scope.resetAmountAndValue();
      $scope.cancel();
    }
    $scope.sendByValue = function(){
      $scope.sendAmount = $scope.convertDisplayedValue($scope.value/$scope.getBitcoinValue());
      $scope.sendAmount = new Big(parseInt($scope.sendAmount)).toFixed(0);
      data.transactionData.amount_to_transfer = $scope.sendAmount;
      $scope.btcValueChanged = false;
      $scope.transactionError = false;
      $scope.bitcoinValue = $scope.getBitcoinValue();
      $scope.setBitcoinValue($scope.getBitcoinValue());
      $scope.resetAmountAndValue();
    }
    $scope.sendByAmount = function(){
     var amount = $scope.convertSatoshiToDisplayedValue($scope.sendAmount);
      $scope.value = amount*$scope.getBitcoinValue();
      $scope.btcValueChanged = false;
      $scope.transactionError = false;
      $scope.bitcoinValue = $scope.getBitcoinValue();
      $scope.setBitcoinValue($scope.getBitcoinValue());
      $scope.resetAmountAndValue();
    }
  };
};



function WalletSendAssetsController($modal, $scope, $http, $q, userService, walletTransactionService) {
  $scope.walletAssets =  $scope.$parent.$parent;
  var transactionGenerationController = $scope.$parent;


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
        error += 'make sure your send amount is at least 0.00005430 BTC if sending BTC, ';
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
    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
    $modalScope.sendAmount=  $scope.selectedCoin.divisible ? +$scope.convertDisplayedValue($scope.sendAmount) : +$scope.sendAmount,
    $modalScope.minerFees= +$scope.convertDisplayedValue($scope.minerFees),
    $modalScope.sendTo= $scope.sendTo;
    $modalScope.totalCost= +$scope.convertDisplayedValue($scope.totalCost);
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
};



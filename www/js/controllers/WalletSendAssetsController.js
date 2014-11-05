angular.module("omniControllers")
  .controller("WalletSendAssetsController", ["$scope","walletTransactionService","WalletAssets",
    function($scope, walletTransactionService, WalletAssets) {
      
      $scope.showErrors = false;
      $scope.walletAssets =  WalletAssets;
      var transactionGenerationController = $scope.$parent;
      // Enable the transaction for offline wallets
      WalletAssets.offlineSupport=true;

      $scope.changeValue = function(){
        $scope.value = $scope.sendAmount*WalletAssets.bitcoinValue;
        $scope.value = new Big($scope.value).toFixed(3);
        $scope.value = parseFloat($scope.value);
      }
      $scope.changeAmount = function(){
        $scope.sendAmount = $scope.value/WalletAssets.bitcoinValue;
        $scope.sendAmount = new Big($scope.sendAmount).toFixed(8);
        $scope.sendAmount = parseFloat($scope.sendAmount);
      }
     
      transactionGenerationController.validateTransactionData = function(){
        var dustValue = 5757;
        var minerMinimum = 10000;
        var nonZeroValue = 1;
        var divisible = WalletAssets.selectedCoin.divisible; 

        var convertToSatoshi = [
            WalletAssets.minerFees,
            $scope.sendAmount,
            WalletAssets.balanceData[0], 
            WalletAssets.balanceData[1],
            WalletAssets.totalCost
          ];

        if (!divisible) {
          delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.sendAmount ) ];
          delete convertToSatoshi[ convertToSatoshi.indexOf( WalletAssets.balanceData[0] ) ];
        }

        var convertedValues = WalletAssets.convertDisplayedValue( convertToSatoshi );

        var minerFees = +convertedValues[0];
        var sendAmount = divisible ? +convertedValues[1] : +$scope.sendAmount;
        var totalFeeCost = +convertedValues[4];

        var balance = divisible ? +convertedValues[2] : +WalletAssets.balanceData[0];
        var btcbalance = +convertedValues[3];

        var coin = WalletAssets.selectedCoin.symbol;
        var address = WalletAssets.selectedAddress;
        var sendTo = $scope.sendTo;
        var marked = $scope.marked;

        var required = [coin, address, sendAmount, sendTo, minerFees, totalFeeCost,  balance, btcbalance, $scope.sendForm.$valid, marked];

        var error = 'Please ';
        if ($scope.sendForm.$valid == false) {
          error += 'make sure all fields are completely filled, ';
        }
        if (coin == 'BTC') {
            if ((sendAmount+minerFees <= balance) == false) {
            error += 'make sure you aren\'t sending more tokens than you own, ';
          }
        }
        else {
            if ((sendAmount <= balance) == false) {
            error += 'make sure you aren\'t sending more tokens than you own, ';
          }
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
        $modalScope.convertSatoshiToDisplayedValue=  WalletAssets.convertSatoshiToDisplayedValue,
        $modalScope.convertDisplayedValue = WalletAssets.convertDisplayedValue;
        $modalScope.getDisplayedAbbreviation=  WalletAssets.getDisplayedAbbreviation,
        $modalScope.sendAmount=  WalletAssets.selectedCoin.divisible ? +WalletAssets.convertDisplayedValue($scope.sendAmount) : +$scope.sendAmount,
        $modalScope.sendAmountDisplayed = parseFloat($scope.sendAmount);
        $modalScope.minerFees= +WalletAssets.convertDisplayedValue(WalletAssets.minerFees),
        $modalScope.sendTo= $scope.sendTo;
        $modalScope.sendFrom= WalletAssets.selectedAddress;
        $modalScope.totalCost= +WalletAssets.convertDisplayedValue(WalletAssets.totalCost);
        $modalScope.bitcoinValue = WalletAssets.bitcoinValue;
        $modalScope.getBitcoinValue = WalletAssets.getBitcoinValue;
        $modalScope.setBitcoinValue = WalletAssets.setBitcoinValue;
        $modalScope.changeValue = $scope.changeValue;
        $modalScope.changeAmount = $scope.changeAmount;
        $modalScope.selectedCoinSymbol = WalletAssets.selectedCoin.symbol;
        $modalScope.value = parseFloat(new Big($scope.value).toFixed(3));
        $modalScope.btcValueChanged = false;

        
      };

      transactionGenerationController.generateData = function(){
        return {
          from:WalletAssets.selectedAddress,
          transactionType:0,
          transactionData:{
            transaction_version:0,
            transaction_from: WalletAssets.selectedAddress,
            currency_identifier:WalletAssets.selectedCoin.id,
            amount_to_transfer : WalletAssets.selectedCoin.divisible ? +WalletAssets.convertDisplayedValue($scope.sendAmount) : +$scope.sendAmount,
            transaction_to: $scope.sendTo,
            fee: WalletAssets.convertDisplayedValue(WalletAssets.minerFees),
            marker: $scope.marked
          }
        }; 
      };

      transactionGenerationController.modalController = function($scope, $modalInstance, data, prepareTransaction, setModalScope, walletAssets) {
        transactionGenerationController.modalBaseController($scope, $modalInstance, data, prepareTransaction, setModalScope, walletAssets);

        $scope.ok = function() {
              if (($scope.bitcoinValue == $scope.getBitcoinValue())||$scope.selectedCoinSymbol != 'BTC') {
                $scope.clicked = true;
                $scope.waiting = true;
                prepareTransaction(data.transactionType, data.transactionData, data.from, $scope);
              }
              else{
                $scope.waiting = false;
                $scope.btcValueChanged = true;
                $scope.newBtcAmount = parseFloat(new Big($scope.value/$scope.getBitcoinValue()).toFixed(8));
                $scope.newValue = parseFloat(new Big($scope.convertSatoshiToDisplayedValue($scope.sendAmount)*$scope.getBitcoinValue()).toFixed(3));
              }
        };      
        $scope.goBack = function(){
          $scope.setBitcoinValue($scope.getBitcoinValue());
          $scope.changeValue();
          $scope.cancel();
        };
        $scope.sendByValue = function(){
          $scope.sendAmount = $scope.convertDisplayedValue($scope.value/$scope.getBitcoinValue());
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
      };
    }]);
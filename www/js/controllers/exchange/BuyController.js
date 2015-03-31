angular.module("omniControllers")
  .controller("ExchangeBuyController",["$scope", "$http", "Transaction", "ADDRESS_EXPLORER_URL",
    function ExchangeBuyController($scope, $http, Transaction, ADDRESS_EXPLORER_URL) {

      $scope.selectedAddress= $scope.hasBitcoins ? $scope.wallet.getAsset(0).tradableAddresses[0] : undefined;
      $scope.setAddress = function(address){
            $scope.selectedAddress = address;
      }
      var transaction = $scope.global['buyOffer'];
      $scope.buySaleID = transaction.tx_hash;
      $http.get('/v1/transaction/tx/' + transaction.tx_hash + '.json').success(function(data) {
        var tx = data[0];
        $scope.selectedCoin=tx.currency_str;
        $scope.bitcoinAddresses = $scope.hasBitcoins ? $scope.wallet.getAsset(0).tradableAddresses : [];
        if(parseInt(tx.currencyId) <3) {
          $scope.divisible = true;
          $scope.sendPlaceholderValue = '1.00000000';
          $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
          $scope.displayedAbbreviation = tx.currency_str;
        } else {
          $http.get("/v1/property/"+tx.currencyId.replace(new RegExp("^0+"), "") +".json", function(data) {
            var property = data[0];
            if(property.propertyType == "0001"){
              $scope.divisible =false;
              $scope.sendPlaceholderValue = $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '1';
            } else  {
              $scope.divisible = true;
              $scope.sendPlaceholderValue = '1.00000000';
              $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
            }
              
            $scope.displayedAbbreviation = property.propertyName + " #" + property.currencyId;
          });
        }
      });
      // [ Buy Form Helpers ]

      $scope.confirm = function(){
        //TODO: VALIDATIONS
        var fee = new Big($scope.minersFee);
        var exchangeAccept = new Transaction(22,$scope.selectedAddress,fee,{
            amount: $scope.buyAmount,
            tx_hash: $scope.buySaleID,
            donate: $scope.account.getSetting("donate")
          });


        $scope.modalManager.openConfirmationModal({
          dataTemplate: '/views/modals/partials/accept.html',
          scope:{
            title:"EXCHANGE.BUY.MODALTITLE",
            displayedAbbreviation: $scope.displayedAbbreviation,
            buyAmount: $scope.buyAmount,
            minerFees: $scope.minersFee,
            selectedCoin: $scope.selectedCoin,
            insufficientBitcoin : $scope.insufficientBitcoin,
            fees : $scope.minersFee,
            totalCost : exchangeAccept.totalCost,
            selectedAddress : $scope.selectedAddress,
            sellerAddress: transaction.from_address,
            offerHash:transaction.tx_hash,
            salePricePerCoin:transaction.formatted_price_per_coin,
            saleBlocks:transaction.formatted_block_time_limit,
            confirmText:"EXCHANGE.BUY.CONFIRM",
            explorerUrl:ADDRESS_EXPLORER_URL,
            successRedirect:"/exchange/trade" 
          },
          transaction:exchangeAccept
        })
      }


      // $scope.validateBuyForm = function() {
      //   var dustValue = 5757;
      //   var minerMinimum = 10000;
      //   var nonZeroValue = 1;
      //   var divisible = $scope.divisible; 

      //   var convertToSatoshi = [
      //       $scope.minerFees,
      //       $scope.buyAmount,
      //       $scope.balanceData[0], 
      //       $scope.balanceData[1]
      //     ];

      //   if (!divisible) {
      //     delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.buyAmount ) ];
      //     delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
      //   }

      //   var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

      //   var minerFees = +convertedValues[0];
      //   var buyAmount = divisible ? +convertedValues[1] : +$scope.buyAmount;
        
      //   var balance = divisible ? +convertedValues[2] : +$scope.balanceData[0];
      //   var btcbalance = +convertedValues[3];

      //   var coin = $scope.selectedCoin;
      //   var address = $scope.selectedAddress;
      //   var saleHash = $scope.buySaleID;
        
      //   var totalBtcCost = parseFloat($scope.convertDisplayedValue(transaction.formatted_price_per_coin * $scope.convertSatoshiToDisplayedValue(buyAmount)));
      //   var totalFeeCost = parseFloat($scope.convertDisplayedValue($scope.totalCost));
      //   var insufficientBitcoin = false;
        
      //   var required = [coin, address, buyAmount, minerFees, balance, btcbalance, $scope.buyForm.$valid];
      //   console.log(required);
      //   var error = 'Please ';
      //   if ($scope.buyForm.$valid == false) {
      //     error += 'make sure all fields are completely filled, ';
      //   }
      //   //should be valid hash
      //   //if( walletTransactionService.validAddress(sendTo) == false) {
      //   //   error += 'make sure you are sending to a valid MSC/BTC address, '
      //   //}
      //   if (coin == 'Bitcoin') {
      //     error += 'make sure your sale is for MSC or TMSC, ';
      //   }
      //   if( ((coin == 'Mastercoin') || (coin == 'Test Mastercoin')) ) {
      //     if (buyAmount < nonZeroValue)
      //       error += 'make sure your send amount is non-zero, ';
      //     if (minerFees < minerMinimum)
      //       error += 'make sure your fee entry is at least 0.0001 BTC, ';
      //     if ((totalFeeCost <= btcbalance) == false)
      //       error += 'make sure you have enough Bitcoin to cover your fees, ';
      //     if ((totalBtcCost+totalFeeCost <= btcbalance) == false) {
      //       insufficientBitcoin = true;
      //     }
      //   }
      //   if (error.length < 8) {
      //     $scope.$parent.showErrors = false;

      //     // open modal
      //     var modalInstance = $modal.open({
      //       templateUrl: '/partials/wallet_buy_modal.html',
      //       controller: function($scope, $modalInstance, $rootScope, data, prepareBuyTransaction, getUnsignedBuyTransaction, convertSatoshiToDisplayedValue) {
      //         $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
      //         $scope.convertSatoshiToDisplayedValue=convertSatoshiToDisplayedValue,
      //         $scope.displayedAbbreviation=data.displayedAbbreviation,
      //         $scope.buyAmount=data.amt,
      //         $scope.minerFees= data.fee,
      //         $scope.selectedCoin= data.selectedCoin;
      //         $scope.insufficientBitcoin = data.insufficientBitcoin
              
      //         $scope.ok = function() {
      //           $scope.clicked = true;
      //           $scope.waiting = true;
      //           prepareBuyTransaction(data.buyer, data.amt, data.hash, data.fee, $scope.privKeyPass, $scope);
      //         };
      //         $scope.cancel = function () {
      //           $modalInstance.dismiss('cancel');
      //         };
      //       },
      //       resolve: {
      //         data: function() {
      //           return {
      //             buyer: address,
      //             amt: buyAmount,
      //             hash: saleHash,
      //             fee: minerFees,
      //             selectedCoin: $scope.selectedCoin,
      //             displayedAbbreviation: $scope.displayedAbbreviation,
      //             insufficientBitcoin: insufficientBitcoin
      //           };
      //         },
      //         prepareBuyTransaction: function() {
      //           return prepareBuyTransaction;
      //         },
      //         getUnsignedBuyTransaction: function() {
      //           return getUnsignedBuyTransaction;
      //         },
      //         pushSignedTransaction: function() {
      //           return walletTransactionService.pushSignedTransaction;
      //         },
      //         convertSatoshiToDisplayedValue: function() {
      //           return $scope.convertSatoshiToDisplayedValue;
      //         }
      //       }
      //     });
      //   } else {
      //     error += 'and try again.';
      //     $scope.error = error;
      //     $scope.$parent.showErrors = true;
      //   }
      // };

    }])
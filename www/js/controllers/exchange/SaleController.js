angular.module("omniControllers")
  .controller("ExchangeSaleController",["$scope", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT",
    function ExchangeSaleController($scope, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT) {

      $scope.confirm = function(){
        //TODO: VALIDATIONS
        var fee = new Big($scope.minersFee);
        var exchangeSale = new Transaction(20,$scope.selectedAddress,fee,{
            amount: +new Big($scope.saleAmount).times(SATOSHI_UNIT).valueOf(),
            price: $scope.salePrice,
            min_buyer_fee: new Big($scope.buyersFee).times(SATOSHI_UNIT).valueOf(),
            blocks: $scope.saleBlocks,
            currency: $scope.selectedAsset.symbol,
            donate: $scope.account.getSetting("donate")
          });


        $scope.modalManager.openConfirmationModal({
          dataTemplate: '/views/modals/partials/sale.html',
          scope:{
            title:"EXCHANGE.SALE.MODALTITLE",
            saleAmount: $scope.saleAmount,
            buyersFee: $scope.buyersFee,
            selectedCoin: $scope.selectedAsset,
            salePricePerCoin: $scope.salePrice / $scope.saleAmount,
            saleBlocks : $scope.saleBlocks,
            fees : $scope.minersFee,
            totalCost : exchangeSale.totalCost,
            confirmText:"EXCHANGE.SALE.CONFIRM",
            explorerUrl:ADDRESS_EXPLORER_URL,
            successRedirect:"/exchange/trade"
          },
          transaction:exchangeSale
        })
      }

      $scope.selectedAddress= $scope.hasCoins ? $scope.selectedAsset.tradableAddresses[0] : undefined;
      $scope.setAddress = function(address){
            $scope.selectedAddress = address;
      }

      

      // $scope.validateSaleForm = function() {
      //   var dustValue = 5757;
      //   var minerMinimum = 10000;
      //   var nonZeroValue = 1;
      //   var cancelFees = (5757*3);
      //   var divisible = $scope.selectedCoin.divisible; 

      //   var convertToSatoshi = [
      //       $scope.minersFee,
      //       $scope.buyersFee,
      //       0, //$scope.salePricePerCoin,
      //       $scope.saleAmount,
      //       $scope.balanceData[0], 
      //       $scope.balanceData[1]
      //     ];

      //   if (!divisible) {
      //     delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.saleAmount ) ];
      //     delete convertToSatoshi[ convertToSatoshi.indexOf( $scope.balanceData[0] ) ];
      //   }

      //   var convertedValues = $scope.convertDisplayedValue( convertToSatoshi );

      //   var minersFee = +convertedValues[0];
      //   var buyersFee = +convertedValues[1];
      //   //var salePricePerCoin = +convertedValues[2];
      //   var saleAmount = divisible ? +convertedValues[3] : +$scope.saleAmount;
        
      //   var balance = divisible ? +convertedValues[4] : +$scope.balanceData[0];
      //   var btcbalance = +convertedValues[5];

      //   var coin = $scope.isCancel != true ? $scope.selectedCoin.symbol : $scope.selectedCoin_extra;
      //   var salePricePerCoin = $scope.salePricePerCoin;
      //   var address = $scope.selectedAddress;
      //   var saleBlocks = +$scope.saleBlocks;

      //   var totalFeeCost = parseFloat($scope.convertDisplayedValue($scope.totalCost));
        
      //   var required = [coin, address, saleAmount, saleBlocks, salePricePerCoin, minersFee, buyersFee, balance, btcbalance, $scope.saleForm.$valid];
        
      //   var error = 'Please ';
      //   if ($scope.saleForm.$valid == false) {
      //     error += 'make sure all fields are completely filled, ';
      //   }
      //   if ( $scope.isCancel != true && coin == 'BTC') {
      //     error += 'make sure your sale is for MSC or TMSC, ';
      //   }
      //   if( $scope.isCancel != true && ((coin == 'MSC') || (coin == 'TMSC')) ) {
      //     if (saleAmount < nonZeroValue)
      //       error += 'make sure your send amount is non-zero, ';
      //     if (buyersFee < minerMinimum)
      //       error += 'make sure your buyers fee entry is at least 0.0001 BTC, ';
      //     if (minersFee < minerMinimum)
      //       error += 'make sure your fee entry is at least 0.0001 BTC, ';
      //     if ((saleAmount <= balance) == false)
      //       error += 'make sure you aren\'t putting more coins up for sale than you own, ';
      //     if ((totalFeeCost <= btcbalance) == false)
      //       error += 'make sure you have enough Bitcoin to cover your fees, ';

      //     if (saleBlocks < 1)
      //       error += 'make sure your block timeframe is at least 1, ';
      //   }
      //   if ($scope.isCancel == true && (((cancelFees + minersFee) <= btcbalance) == false) )
      //     error += 'make sure you have enough Bitcoin to cover your transaction fees, ';
      //   if (error.length < 8) {
      //     $scope.$parent.showErrors = false;

      //     // open modal
      //     var modalInstance = $modal.open({
      //       templateUrl: $scope.isCancel == true ? '/partials/wallet_cancel_modal.html' : '/partials/wallet_sale_modal.html',
      //       controller: function($scope, $modalInstance, $rootScope, data, prepareSaleTransaction, getUnsignedSaleTransaction, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
      //         $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
      //         $scope.convertSatoshiToDisplayedValue=convertSatoshiToDisplayedValue,
      //         $scope.getDisplayedAbbreviation=getDisplayedAbbreviation,
      //         $scope.saleAmount=data.amt,
      //         $scope.buyersFee=data.buyersfee,
      //         $scope.selectedCoin=data.selectedCoin,
      //         $scope.salePricePerCoin= data.price,
      //         $scope.saleBlocks = data.blocks;

      //         $scope.ok = function() {
      //           $scope.clicked = true;
      //           $scope.waiting = true;

      //           prepareSaleTransaction(data.seller, data.amt, data.price,
      //           data.buyersfee, data.fee, data.blocks, data.currency, $scope.privKeyPass, $scope);
      //         };
      //         $scope.cancel = function () {
      //           $modalInstance.dismiss('cancel');
      //         };
      //       },
      //       resolve: {
      //         data: function() {
      //           return {
      //             seller: address,
      //             amt: saleAmount,
      //             price: salePricePerCoin,
      //             buyersfee: buyersFee,
      //             fee: minersFee,
      //             blocks: saleBlocks,
      //             currency: coin,
      //             selectedCoin: $scope.selectedCoin,
      //             saleBlocks: saleBlocks
      //           };
      //         },
      //         prepareSaleTransaction: function() {
      //           return prepareSaleTransaction;
      //         },
      //         getUnsignedSaleTransaction: function() {
      //           return getUnsignedSaleTransaction;
      //         },
      //         pushSignedTransaction: function() {
      //           return walletTransactionService.pushSignedTransaction;
      //         },
      //         convertSatoshiToDisplayedValue: function() {
      //           return $scope.convertSatoshiToDisplayedValue;
      //         },
      //         getDisplayedAbbreviation: function() {
      //           return $scope.getDisplayedAbbreviation;
      //         }
      //       }
      //     });

      //     modalInstance.result.then(function() {
      //       if ($scope.isCancel)
      //         $scope.$parent.$parent.$parent.cancelTrig = null;
      //     }, function() {
      //       if ($scope.isCancel)
      //         $scope.$parent.$parent.$parent.cancelTrig = null;
      //     });

      //   } else {
      //     error += 'and try again.';
      //     $scope.error = error;
      //     $scope.$parent.showErrors = true;
      //   }
      // };
    }])


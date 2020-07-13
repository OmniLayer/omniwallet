angular.module("omniControllers")
  .controller("ExchangeSaleController",["$scope", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT","MINER_SPEED",
    function ExchangeSaleController($scope, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT,MINER_SPEED) {
                  $scope.editTransactionCost = function(){
                  $scope.modalManager.openTransactionCostModal($scope, function(){return;});
            }
      $scope.confirm = function(){
        //TODO: VALIDATIONS
        var fee = new Big($scope.minersFee);
        var exchangeSale = new Transaction(20,$scope.selectedAddress,fee,{
            transaction_version:1,
            amount_for_sale: +new Big($scope.saleAmount).valueOf(),
            amount_desired: $scope.salePrice,
            min_buyer_fee: new Big($scope.buyersFee).valueOf(),
            blocks: $scope.saleBlocks,
            currency_identifier: $scope.selectedAsset.propertyid,
            action:1,
            donate: $scope.account.getSetting("donate")
          });


        $scope.modalManager.openConfirmationModal({
          dataTemplate: '/views/modals/partials/sale.html',
          scope:{
            title:"EXCHANGE.SALE.MODALTITLE",
            saleAmount: $scope.saleAmount,
            buyersFee: $scope.buyersFee,
            selectedCoin: $scope.selectedAsset,
            salePricePerCoin: ($scope.salePrice / $scope.saleAmount).toFixed(8),
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

      $scope.selectedAsset = $scope.wallet.getAsset(0,true);
      $scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
      $scope.feeType = MINER_SPEED;

      $scope.setAsset = function(asset){
                $scope.selectedAsset = asset;
                $scope.selectedAddress = $scope.selectedAsset.tradableAddresses[0];
                $scope.updatingFee = false;
                $scope.amountModified=false;
                $scope.saleAmount=null;
                $scope.salePrice=null;
      }


      $scope.showtesteco = $scope.account.getSetting('showtesteco');
      $scope.setAddress = function(address){
            $scope.selectedAddress = address;
            $scope.selectedAddress.estimateFee().then(function(result){
                $scope.feeData=result;
                if($scope.feeType != 'custom'){
                    $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                    $scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
                }
            });
      }

      $scope.setAddress($scope.selectedAddress);

    }])


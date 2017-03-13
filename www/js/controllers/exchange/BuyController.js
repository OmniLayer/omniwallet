angular.module("omniControllers")
  .controller("ExchangeBuyController",["$scope", "$http", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT","MINER_SPEED",
    function ExchangeBuyController($scope, $http, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT,MINER_SPEED) {
      $scope.editTransactionCost = function(){
        $scope.modalManager.openTransactionCostModal($scope, function(){return;});
      }
      $scope.selectedAddress= $scope.hasBitcoins ? $scope.wallet.getAsset(0).tradableAddresses[0] : undefined;
      $scope.feeType = MINER_SPEED;
      $scope.setAddress = function(address){
            $scope.selectedAddress = address;
            if (address!=undefined) {
              $scope.selectedAddress.estimateFee().then(function(result){
                $scope.feeData=result;
                if($scope.feeType != 'custom'){
                    $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                    $scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
                }
              });
            }
      }
      $scope.setAddress($scope.selectedAddress);
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
            transaction_version:0,
            amount: +new Big($scope.buyAmount).valueOf(),
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
            totalCost : exchangeAccept.totalCost.valueOf(),
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
    }])

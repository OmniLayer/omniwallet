angular.module("omniControllers")
  .controller("ExchangeBuyController",["$scope", "$http", "Transaction", "ADDRESS_EXPLORER_URL", "SATOSHI_UNIT","MINER_SPEED",
    function ExchangeBuyController($scope, $http, Transaction, ADDRESS_EXPLORER_URL, SATOSHI_UNIT,MINER_SPEED) {

      $scope.editTransactionCost = function(){
        $scope.modalManager.openTransactionCostModal($scope, function(){ checkSend();});
      }

      if ($scope.account.loggedIn) {
        $scope.hasBitcoins = $scope.wallet.getAsset(0).tradable;
      } else {
        $scope.hasBitcoins = false;
      }

      selling_address = $scope.global['buyOffer'].from_address;
      $scope.buying_addresses = $scope.wallet.getAsset(0).tradableAddresses.filter(function(item) {
        var address = item.hash
        return (address != selling_address);
      });


      $scope.selectedAddress= $scope.hasBitcoins ? $scope.buying_addresses[0] : undefined;
      $scope.feeType = MINER_SPEED;

      $scope.setAddress = function(address){
        $scope.selectedAddress = address;
        checkSend();
      }

      $scope.setAddress($scope.selectedAddress);

      function checkSend() {
                if($scope.selectedAddress != undefined){
                  avail = parseFloat($scope.selectedAddress.getDisplayBalance(0));
                  //console.log(avail);

                  $scope.selectedAddress.estimateFee().then(function(result){
                    $scope.feeData=result;
                    if($scope.feeType != 'custom'){
                      $scope.minersFee = new Big(result.class_c[$scope.feeType]);
                      $scope.topupAmount = new Big(result.topup_c[$scope.feeType]);
                    }
                  });

                  if ( avail >= parseFloat($scope.minersFee) + parseFloat($scope.protocolFee) ) {
                    $scope.cansend = true;
                  } else {
                    $scope.cansend = false;
                  }
                  //console.log($scope.cansend);
                } else {
                    $scope.cansend = false;
                }
      }


      var transaction = $scope.global['buyOffer'];
      $scope.buySaleID = transaction.tx_hash;
      $http.get('/v1/transaction/tx/' + transaction.tx_hash + '.json').success(function(data) {
        var tx = data[0];
        $scope.selectedCoin=tx.currency_str;
        $scope.displayedAbbreviation = tx.currency_str;
        $scope.divisible = tx.divisible;
        if($scope.divisible){
          $scope.sendPlaceholderValue = '1.00000000';
          $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
        } else  {
          $scope.sendPlaceholderValue = $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '1';
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

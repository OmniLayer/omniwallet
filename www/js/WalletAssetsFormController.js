WHOLE_UNIT = new Big(0.00000001); //Backend data returns satoshi, use this conversion ratio
SATOSHI_UNIT = new Big(100000000); //Backend data needs satoshi, use this conversion ratio
MIN_MINER_FEE = new Big(0.00010000);
function WalletAssetsFormController($scope, $injector, userService, walletTransactionService) {
  // [ Form Validation]
  $scope.showErrors = false;

  // [ Template Initialization ]

  $scope.currencyList = userService.getCurrencies().filter(function(currency){
       return currency.tradable;
  }); // [{symbol: 'BTC', addresses:[], name: 'BTC'}, {symbol: 'MSC', addresses:[], name: 'MSC'}, {symbol: 'TMSC', addresses:[], name: 'TMSC'}]
  
  //Set default if not inherited.
  if (!$scope.$parent.selectedCoin){
    $scope.selectedCoin = $scope.currencyList[0];
    $scope.currencyList.forEach(function(e, i) {
      if (e.symbol == "MSC")
        $scope.selectedCoin = e;
    });
  }
  $scope.addressList = $scope.selectedCoin ? userService.getTradableAddresses($scope.selectedCoin.tradableAddresses, $scope.offlineSupport) : [];
  if(!$scope.$parent.selectedAddress)
    $scope.selectedAddress = $scope.addressList[0] || null;
  $scope.$watch('selectedCoin', function() {
    updateData()
  });
  $scope.$watch('offlineSupport', function() {
    updateData()
  });
  $scope.$watch('selectedAddress', function() {
    $scope.setBalance();
    var pubkey = userService.getAddress($scope.selectedAddress).pubkey;
    $scope.offline = pubkey != undefined && pubkey != "";
  });
  
  var updateData = function(){
    $scope.addressList = $scope.selectedCoin ? userService.getTradableAddresses($scope.selectedCoin.tradableAddresses, $scope.offlineSupport) : [];
    if(!$scope.$parent.selectedAddress)
      $scope.selectedAddress = $scope.addressList[0] || null;
    $scope.setBalance();
    $scope.minerFees = +MIN_MINER_FEE.valueOf(); // reset miner fees
    $scope.calculateTotal($scope.minerFees);
  }
  $scope.calculateTotal = calculateTotal;

  $scope.minerFees = +MIN_MINER_FEE.valueOf(); //set default miner fees
  $scope.calculateTotal($scope.minerFees);

  // [ Retrieve Balances ]
  $scope.currencyUnit = 'stom'; // satoshi to millibitt
  $scope.amountUnit = 'mtow';
  $scope.balanceData = [0];
  var addrListBal = [];
  // fill the addrBalanceList with all the addresses on the wallet for which we've got private keys.
  userService.getAddressesWithPrivkey().concat(userService.getAddressesWithPubkey()).forEach(function(e, i) {
    if(Bitcoin.Address.validate(e)){
      var balances = [
        {
          symbol: 'MSC',
          value: '0'
        },
        {
          symbol: 'TMSC',
          value: '0'
        },
        {
          symbol: 'BTC',
          value: '0'
        }];
      addrListBal[i] = {
        address: e,
        balance: balances
      };
      var promise = walletTransactionService.getAddressData(e);
      promise.then(function(successData) {
        var successData = successData.data;
        addrListBal[i].balance =  successData.balance;
        $scope.setBalance();
      }, function(errorData) {
        //alert("We have encountered a problem accessing the server ... Please try again in a few minutes");
        console.log('Error, no balance data found for ' + e + ' setting defaults...');
      });
    }
  });
  
  $scope.setBalance = function() {
    var coin = $scope.selectedCoin ? $scope.selectedCoin.symbol : null;
    var address = $scope.selectedAddress;
    $scope.balanceData = [0,0];
    if (address || coin) {
      for (var i = 0; i < addrListBal.length; i++) {
        if (addrListBal[i].address == address) {
          for (var k = 0; k < addrListBal[i].balance.length; k++) {
            if (addrListBal[i].balance[k].symbol == coin) {
              var divisible = addrListBal[i].balance[k].divisible;
              $scope.balanceData[0] = divisible ? new Big(addrListBal[i].balance[k].value).times(WHOLE_UNIT).valueOf() : addrListBal[i].balance[k].value;
            }
            if (addrListBal[i].balance[k].symbol == 'BTC') {
              $scope.balanceData[1] = new Big(addrListBal[i].balance[k].value).times(WHOLE_UNIT).valueOf();
            }
          }
        }
      }
    }
  };

  $scope.convertSatoshiToDisplayedValue = function(satoshi, forceConvertToWhole ) {
      if($scope.selectedCoin.divisible || forceConvertToWhole )
        return new Big(satoshi).times(WHOLE_UNIT).toFixed(8);
      else
        return satoshi;
  };


  $scope.getDisplayedAbbreviation = function () {
    if($scope.selectedCoin.divisible) {
      $scope.sendPlaceholderValue = '1.00000000';
      $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '0.00000001';
    } else {
      $scope.sendPlaceholderValue = $scope.sendPlaceholderStep = $scope.sendPlaceholderMin = '1';
    }
    if ($scope.selectedCoin.symbol.indexOf('SP') == 0) {
      for (var i in $scope.currencyList) {
        if ($scope.currencyList[i].symbol == $scope.selectedCoin.symbol)
          return $scope.currencyList[i].name + ' #' + $scope.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
      }
      return 'Smart Property #' + $scope.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
    }
    else
      return $scope.selectedCoin.symbol;
  };
  
  $scope.getBitcoinValue = function(){
    var appraiser = $injector.get('appraiser');
    return appraiser.getValue(100000000,"BTC");
  }
  $scope.setBitcoinValue = function(value){
    $scope.bitcoinValue = value;
  } 
  $scope.convertDisplayedValue = function (value) {
      if (value instanceof Array) {
        value.forEach(function(e, i, a) {
            a[i] = new Big(e).times(SATOSHI_UNIT).valueOf();
        });
        return value;
      } 
      else
          return new Big(value).times(SATOSHI_UNIT).valueOf();
  };

  function calculateTotal(minerFees) {
    $scope.mProtocolCost = 0.00025
    if ($scope.selectedCoin && $scope.selectedCoin.symbol == 'BTC')
      $scope.mProtocolCost = 0.0;
    $scope.totalCost = (+new Big(minerFees).plus($scope.mProtocolCost).valueOf()).toFixed(8);
  }
};
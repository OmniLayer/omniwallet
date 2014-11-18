WHOLE_UNIT = new Big(0.00000001); //Backend data returns satoshi, use this conversion ratio
SATOSHI_UNIT = new Big(100000000); //Backend data needs satoshi, use this conversion ratio
MIN_MINER_FEE = new Big(0.00010000);
function WalletAssetsFormController($scope, $injector, Wallet, walletTransactionService) {
  // [ Form Validation]
  $scope.showErrors = false;

  // [ Template Initialization ]

  $scope.currencyList = Wallet.assets.filter(function(currency){
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
  $scope.addressList = $scope.selectedCoin ? $scope.selectedCoin.tradableAddresses.filter(function(e) {
          return $scope.offlineSupport || (e.privkey && e.privkey.length == 58);
        }).map(function(e){
          return e.address;
        }) : [];
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
    var pubkey = Wallet.getAddress($scope.selectedAddress).pubkey;
    $scope.offline = pubkey != undefined && pubkey != "";
  });
  
  var updateData = function(){
    $scope.addressList = $scope.selectedCoin ? $scope.selectedCoin.tradableAddresses.filter(function(e) {
          return $scope.offlineSupport || (e.privkey && e.privkey.length == 58);
        }).map(function(e){
          return e.address;
        }) : [];
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
  Wallet.addresses.forEach(function(e, i) {
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
    var coin = $scope.selectedCoin;
    var address = $scope.selectedAddress;
    $scope.balanceData = [0,0];
    if (address && coin) {
      var value = Wallet.getAddress($scope.selectedAddress).getBalance($scope.selectedCoin.id).value;
      $scope.balanceData[0] = coin.divisible ? new Big(value).times(WHOLE_UNIT).valueOf() : value;
      $scope.balanceData[1] = new Big(Wallet.getAddress($scope.selectedAddress).getBalance(0).value).times(WHOLE_UNIT).valueOf();
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
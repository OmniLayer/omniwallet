function WalletTradeFormController($scope, userService, walletTradeService) {
  // [ Form Validation]

  $scope.showErrors = false;

  // [ Template Initialization ]

  $scope.currencyList = userService.getCurrencies(); // [{symbol: 'BTC', addresses:[], name: 'BTC'}, {symbol: 'MSC', addresses:[], name: 'MSC'}, {symbol: 'TMSC', addresses:[], name: 'TMSC'}]
  
  $scope.selectedCoin = $scope.currencyList[0];
  $scope.currencyList.forEach(function(e, i) {
    if (e.symbol == "MSC")
      $scope.selectedCoin = e;
  });

  $scope.addressList = userService.getAddressesWithPrivkey($scope.selectedCoin.addresses);
  $scope.selectedAddress = $scope.addressList[0];
  $scope.$watch('selectedCoin', function() {
    $scope.addressList = userService.getAddressesWithPrivkey($scope.selectedCoin.addresses);;
    $scope.selectedAddress = $scope.addressList[0];
    $scope.setBalance();
  });
  
  $scope.minerFees = formatCurrencyInFundamentalUnit(0.0001, 'wtom');

  // [ Retrieve Balances ]
  $scope.currencyUnit = 'stom'; // satoshi to millibitt
  $scope.amountUnit = 'mtow';
  $scope.balanceData = [0];
  var addrListBal = [];
  $scope.addressList.forEach(function(e, i) {
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
    var promise = walletTradeService.getAddressData(e);
    promise.then(function(successData) {
      var successData = successData.data;
      addrListBal[i].balance =  successData.balance;
      $scope.setBalance();
    }, function(errorData) {
      alert("We have encountered a problem accessing the server ... Please try again in a few minutes");
      //console.log('Error, no balance data found for ' + e + ' setting defaults...');
    });
  });
  
  $scope.setBalance = function() {
    var coin = $scope.selectedCoin.symbol;
    var address = $scope.selectedAddress;
    $scope.balanceData = [0,0];
    if (address || coin) {
      for (var i = 0; i < addrListBal.length; i++) {
        if (addrListBal[i].address == address) {
          for (var k = 0; k < addrListBal[i].balance.length; k++) {
            if (addrListBal[i].balance[k].symbol == coin) {
              $scope.balanceData[0] = addrListBal[i].balance[k].value;
            }
            if (addrListBal[i].balance[k].symbol == 'BTC') {
              $scope.balanceData[1] = addrListBal[i].balance[k].value;
            }
          }
        }
      }
    }
  };
};

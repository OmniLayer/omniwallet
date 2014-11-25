angular.module("omniControllers")
  .controler("OverviewController",["$scope", "$location" "Account", "Wallet", 
    function WalletOverviewController($scope, $location, Account, Wallet) {
      $scope.uuid = Account.uuid;
      $scope.loginLink = $location.protocol() + "://" + $location.host() + "/login/" + $scope.uuid;
      //console.log(Wallet.addresses);
      $scope.firstLogin = Account.firstLogin;
      // HACK: We check for Account.isLoggedIn since this controller is used when not logged in
      $scope.addrList = [];
      $scope.addrListBal = [];
      $scope.maxCurrencies = [];
      $scope.totals = {};

      $scope.addrList =  Wallet.addresses.map(function(e, i, a) {
        return e.address;
      });

      Wallet.addresses.forEach(function(address, index) {
        if (address.balance.length > 0)
          $scope.maxCurrencies = address.balance;

        for (var i = 0; i < address.balance.length; i++) {
          var symbolTotal = $scope.totals[address.balance[i].symbol];
          //          console.log(symbolTotal, address.balance[i].symbol)
          if (!symbolTotal)
            $scope.totals[address.balance[i].symbol] = 0;
          $scope.totals[address.balance[i].symbol] += +address.balance[i].value;
        }
      });
      $scope.disclaimerSeen = Account.settings.disclaimerSeen;
      $scope.$on('$locationChangeSuccess', function(path) {
        Account.settings.disclaimerSeen = true;
      });
    }]);

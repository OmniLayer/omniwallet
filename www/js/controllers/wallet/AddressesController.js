angular.module("omniControllers")
  .controller('WalletAddressesController', [ "$scope", "$route", function($scope, $route) {
    $scope.templates = {
      addresses:'/views/wallet/partials/addresses_list.html',
      assets:'/views/wallet/partials/assets_list.html',
      spendable:'/views/wallet/partials/addresses_list_spend.html',
      watch_only:'/views/wallet/partials/addresses_list_watch.html'
    }

    $scope.listTemplate = $scope.templates['addresses'];

    $scope.spendable = false;
    $scope.watchonly = false;

    $scope.wallet.addresses.forEach(function(addr){
      if (addr.privkey != undefined || addr.pubkey != undefined) {
        $scope.spendable = true;
      }
      if(addr.privkey == undefined && addr.pubkey == undefined) {
        $scope.watchonly = true;
      }
    });

    $scope.$on('reloadAddrView', function() {
      $route.reload();
    });

    $scope.createBTCAddress = function createBTCAddress() {
      var ecKey = new Bitcoin.ECKey();
      var address = ecKey.getBitcoinAddress().toString();
      var encryptedPrivateKey = ecKey.getEncryptedFormat(address);
      $scope.account.addAddress(address, encryptedPrivateKey);
      $scope.addedNewAddress = true;
      $scope.createdAddress = address;
    };

    $scope.showtesteco = $scope.account.getSetting('showtesteco');
  }]);

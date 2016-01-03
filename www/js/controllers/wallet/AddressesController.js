angular.module("omniControllers")
	.controller('WalletAddressesController', [ "$scope", function($scope) {
    $scope.templates = {
      addresses:'/views/wallet/partials/addresses_list.html',
      assets:'/views/wallet/partials/assets_list.html'
    }

    $scope.listTemplate = $scope.templates['addresses'];
  
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
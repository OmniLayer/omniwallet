angular.module( 'omniwallet' )
  .factory( 'enumerated_addresses', function ( $http, $q, $timeout, $injector ) {
    var count = 1;
    return {
      "getData": function() {
        var deferred = $q.defer();

        _.defer( function() {
          var wallet = $injector.get( 'userService' ).getWallet();
          if( wallet && wallet.addresses.length > 0 )
          {

            deferred.resolve( { 
              addresses: wallet.addresses
            } );
          }
          else
          {
            deferred.resolve( { addresses: [] } );
          }
        } );
        return deferred.promise;
      } 
    };
  })
  .controller( 'AddAddressController', function( $modal, $injector, $scope, enumerated_addresses ) {

    function decodeAddressFromPrivateKey( key ) {

      //  Return the address decoded from the private key.
      var eckey = new Bitcoin.ECKey( key );
      var addr = eckey.getBitcoinAddress().toString();

      return addr;
    };

    function encodePrivateKey( key, passphrase ) {

      //  Return encoded key.  Forget the passphrase forever.
      var eckey = new Bitcoin.ECKey( key );
      var enc = eckey.getEncryptedFormat( passphrase );

      return enc;
    };


    // Begin Import watch only Form Code
    $scope.openImportWatchOnlyForm = function() {
      var modalInstance = $modal.open({
        templateUrl: '/partials/import_watch_only.html',
        controller: AddBtcAddressModal
      });

      modalInstance.result.then(function ( result ) {

        if( result.address )
        {
          $injector.get( 'userService' ).addAddress( result.address );
        }
        $scope.refresh();

      }, function () {});
    };

    var AddBtcAddressModal = function ($scope, $modalInstance ) {
      $scope.validate = function( address ) {
        console.log( 'Validate: ' + address );
        return Bitcoin.Address.validate( address );
      };

      $scope.ok = function ( result ) {
        if( Bitcoin.Address.validate( result.address ))
          $modalInstance.close( result );
        else
          console.log( '*** Invalid address: ' + result.address );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Done Import Watch Only Form Code.

    // Begin Import Private Key Form Code
    $scope.openImportPrivateKeyForm = function() {
      var modalInstance = $modal.open({
        templateUrl: '/partials/import_private.html',
        controller: AddPrivateKeyModal
      });

      modalInstance.result.then(function ( result ) {

        if( result.privKey && result.password )
        {
          $injector.get( 'userService' ).addAddress( 
            decodeAddressFromPrivateKey( result.privKey ), 
            encodePrivateKey( result.privKey, result.password ));
        }
        $scope.refresh();

      }, function () {});
    };

    var AddPrivateKeyModal = function ($scope, $modalInstance ) {
      $scope.ok = function ( result ) {
        $modalInstance.close( result );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Done Import Private Key Form Code.
    // Begin Import Encrypted Key Form Code
    $scope.openImportEncryptedKeyForm = function() {
      var modalInstance = $modal.open({
        templateUrl: '/partials/import_encrypted_private.html',
        controller: AddEncryptedPrivateModal
      });

      modalInstance.result.then(function ( result ) {

        if( result.privKey && result.password )
        {
          $injector.get( 'userService' ).addAddress( 
            decodeAddressFromPrivateKey( result.privKey ), 
            encodePrivateKey( result.privKey, result.password ));
        }
        $scope.refresh();

      }, function () {});
    };

    var AddEncryptedPrivateModal = function ($scope, $modalInstance ) {
      $scope.ok = function ( result ) {
        $modalInstance.close( result );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Done Import Encrypted Private Key Code.

    // Begine Create Form Code.
    $scope.openCreateAddressModal = function() {
      var modalInstance = $modal.open({
        templateUrl: '/partials/create_address_modal.html',
        controller: CreateAddressModal
      });

      modalInstance.result.then( function( result ) {
        var ecKey = new Bitcoin.ECKey();
        var address = ecKey.getBitcoinAddress().toString();
        var encryptedPrivateKey = ecKey.getEncryptedFormat( result.password );
        $injector.get( 'userService' ).addAddress(address, encryptedPrivateKey);
        $scope.refresh();
      }, function() {} );
    };

    var CreateAddressModal = function ($scope, $modalInstance ) {
      $scope.ok = function ( result ) {
        $modalInstance.close( result );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Done Create Form Code.


    $scope.enumerateAddresses = function () {

      $scope.items = enumerated_addresses.getData().then( function( result ) {
        $scope.addresses = result.addresses;
      } );          
    };


  } );



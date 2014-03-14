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


    // Begin Add Form Code
    $scope.openAddForm = function( currency ) {
      var modalInstance = $modal.open({
        templateUrl: '/partials/add_' + currency + '_address_modal.html',
        controller: AddBtcAddressModal
      });

      modalInstance.result.then(function ( result ) {

        if( result.privKey && result.password )
        {
          $injector.get( 'userService' ).addAddress( 
            decodeAddressFromPrivateKey( result.privKey ), 
            encodePrivateKey( result.privKey, result.password ));
        }
        else if( result.address )
        {
          $injector.get( 'userService' ).addAddress( result.address );
        }
        $scope.refresh();

      }, function () {});
    };

    var AddBtcAddressModal = function ($scope, $modalInstance ) {
      $scope.ok = function ( result ) {
        $modalInstance.close( result );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };
    // Done Add Form Code.

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



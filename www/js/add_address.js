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

    $scope.openCreateAddressModal = function() {
      $modal.open({
        templateUrl: '/partials/create_address_modal.html',
        controller: CreateAddressController
      });
    }

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
        $scope.showWalletBalances();

      }, function () {});
    };

    $scope.enumerateAddresses = function () {

      $scope.items = enumerated_addresses.getData().then( function( result ) {
        $scope.addresses = result.addresses;
      } );          
    };

    var AddBtcAddressModal = function ($scope, $modalInstance ) {
      $scope.ok = function ( result ) {
        $modalInstance.close( result );
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    };

  } );

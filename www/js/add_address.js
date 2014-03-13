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
            var requests = [];

            var balances = {};
            var invalidAddresses = [];
            var currencyInfo;
            var emptyAddresses = [];

            var appraiser = $injector.get( 'appraiser' );

            wallet.addresses.forEach( function( addr ) {
              requests.push( addressRequest( $http, $q, addr ).then( function( result ) {
                console.log( result.data );
                if( result.data.balance.length == 0 )
                {
                  console.log( 'No balances for ' + addr.address + ', invalid address?' );
                  invalidAddresses.push( addr.address );
                }
                else
                {
                result.data.balance.forEach( function( currencyItem ) {
                  if( !balances.hasOwnProperty( currencyItem.symbol )) {
                    balances[ currencyItem.symbol ] = {
                      "symbol": currencyItem.symbol,
                      "balance": parseInt( currencyItem.value ),
                      "value": appraiser.getValue( currencyItem.value, currencyItem.symbol ),
                      "addresses": {}
                    };
                  }
                  else
                  {
                    balances[ currencyItem.symbol ].balance += parseInt( currencyItem.value );
                    balances[ currencyItem.symbol ].value += appraiser.getValue( currencyItem.value, currencyItem.symbol );
                  }
                  balances[ currencyItem.symbol ].addresses[ result.data.address ] = {
                    "address": result.data.address,
                    "balance": currencyItem.value,
                    "value": appraiser.getValue( currencyItem.value, currencyItem.symbol )
                  };
                } );
              }
              }));
            });
            requests.push( $http.get( '/v1/transaction/values.json' ).then( 
              function( result ) {
                currencyInfo = result.data;
              }
            ));
            $q.all( requests ).then( function( responses ) {
              if( currencyInfo )
              {
                currencyInfo.forEach( function( item ) {
                  if( balances.hasOwnProperty( item.currency ))
                    balances[ item.currency ].name = item.name;
                });

                deferred.resolve( 
                  { 
                    invalidAddresses: invalidAddresses,
                    balances: balances,
                    currencies: currencyInfo
                  } );
              }
            } );
          }
          else
          {
            $http.get( '/v1/transaction/values.json' ).then( 
              function( currencyInfo ) {
                deferred.resolve( { currencies: currencyInfo } );
              }
            );
          } 
        });

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

      $scope.items = enumerated_addresses.getData().then( function( balances ) {
        $scope.balances = balances;
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

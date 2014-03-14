
angular.module( 'omniwallet' )
  .factory( 'wallet_balances_template', function ( $q, $http ) {
    var deferred = $q.defer();

    $http.get( '/partials/wallet_address_list.html' ).then( function( result ) {
      deferred.resolve( result.data );
    } );

    return deferred.promise;
  })
  .factory( 'wallet_balances_data', function ( $http, $q, $timeout, $injector ) {
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
  .directive( 'showWalletBalances', function( $compile, $injector ) {
    return {
      scope: true,
      link: function ( scope, element, attrs ) {
          var el;

          attrs.$observe( 'template', function ( tpl ) {
            if ( angular.isDefined( tpl ) ) {
              // compile the provided template against the current scope
              el = $compile( tpl )( scope );

              // stupid way of emptying the element
              element.html("");

              // add the template content
              element.append( el );
            }
          });
        }
    }
  } )
  .controller( 'WalletBalancesController', function ( $modal, $rootScope, $injector, $scope, wallet_balances_data, wallet_balances_template ) {

  var appraiser = $injector.get( 'appraiser' );
  $rootScope.$on( 'APPRAISER_VALUE_CHANGED', function() {
    $scope.refresh();
  });

   $scope.openDeleteConfirmForm = function( address ) {
      var modalInstance = $modal.open( {
        templateUrl: '/partials/delete_address_modal.html',
        controller: DeleteBtcAddressModal,
        resolve: {
          address: function() {
            return address;
          }
        }
      });

      modalInstance.result.then( function() {
        $injector.get( 'userService' ).removeAddress( address );
        $scope.refresh();
      }, function() {} );
    };

    $scope.refresh = function () {

      $scope.items = wallet_balances_data.getData().then( function( balances ) {
        $scope.balances = balances;
        wallet_balances_template.then( function( templ ) {
          _.defer( function() {
            $scope.template = templ;
            $scope.$apply();
          });
        }); 
      } );          
    };
  });


var DeleteBtcAddressModal = function ($scope, $modalInstance, address ) {
  $scope.address = address;

  $scope.ok = function () {
    $modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

function addressRequest( $http, $q, addr ) {
  var deferred = $q.defer();


  $http.post( '/v1/address/addr/', { 'addr': addr.address } )
    .success( function( result ) {
      deferred.resolve( { data: result } );
    } ).error(
    function( error ) {
      deferred.resolve( {
        data: { 
          address: addr.address,
          balance: []
           }
      });
    }
  );

  return deferred.promise;
}


angular.module( 'omniwallet' )
  .factory( 'asset_types_template', function ( $q, $http ) {
    var deferred = $q.defer();

    $http.get( '/partials/asset_types.html' ).then( function( result ) {
      deferred.resolve( result.data );
    } );

    return deferred.promise;
  })
  .factory( 'asset_types_data', function ( $http, $q, $timeout, $injector ) {
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
            var currencyInfo;
            var emptyAddresses = [];

            var appraiser = $injector.get( 'appraiser' );

            wallet.addresses.forEach( function( addr ) {
              requests.push( addressRequest( $http, $q, addr ).then( function( result ) {
                result.data.balance.forEach( function( currencyItem ) {
                  if( !balances.hasOwnProperty( currencyItem.symbol )) {
                    balances[ currencyItem.symbol ] = {
                      "symbol": currencyItem.symbol,
                      "balance": parseFloat( currencyItem.value ),
                      "value": appraiser.getValue( currencyItem.value, currencyItem.symbol ),
                    };
                  }
                  else
                  {
                    balances[ currencyItem.symbol ].balance += parseFloat( currencyItem.value );
                    balances[ currencyItem.symbol ].value += appraiser.getValue( currencyItem.value, currencyItem.symbol );
                  }
                } );
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
  .directive( 'showAssetTypes', function( $compile, $injector ) {
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
  .controller( 'AssetTypesController', function ( $modal, $rootScope, $injector, $scope, asset_types_data, asset_types_template ) {

  var appraiser = $injector.get( 'appraiser' );
  $rootScope.$on( 'APPRAISER_VALUE_CHANGED', function() {
    $scope.showAssetTypes();
  });
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
        $scope.showAssetTypes();

      }, function () {});
    };

    $scope.showAssetTypes = function () {

      $scope.items = asset_types_data.getData().then( function( balances ) {
        $scope.balances = balances;

        var total = 0;
        for( var k in balances.balances )
        {
          console.log( balances.balances[k] );
          if( typeof balances.balances[k].value == 'number' )
            total += balances.balances[k].value;
        }
        $scope.total = total;

        asset_types_template.then( function( templ ) {
          _.defer( function() {
            $scope.template = templ;
            $scope.$apply();
          });
        }); 
      } );          
    };
  });

var AddBtcAddressModal = function ($scope, $modalInstance ) {
  $scope.ok = function ( result ) {
    $modalInstance.close( result );
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

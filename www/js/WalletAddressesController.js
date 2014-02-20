function PopoverDemoCtrl( $scope, $rootScope ) {
  $scope.content = "Hello, World!";
  $scope.title = "Title";

  console.log( '*** PopoverDemoCtrl!' );
};

var ModalDemoCtrl = function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: '/partials/delete_address_modal.html',
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
};

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};


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
          var wallet = $injector.get( 'userService' ).data
          if( wallet && wallet.addresses.length > 0 )
          {
            var requests = [];

            var balances = {};
            var currencyInfo;

            wallet.addresses.forEach( function( addr ) {
              requests.push( $http.get( '/v1/address/addr/' + addr.address + '.json' ).then( function( result ) {
                if( result.status = 200 ) {
                  result.data.balance.forEach( function( currencyItem ) {
                    if( !balances.hasOwnProperty( currencyItem.symbol )) {
                      balances[ currencyItem.symbol ] = {
                        "symbol": currencyItem.symbol,
                        "balance": parseFloat( currencyItem.value ),
                        "addresses": {}
                      };
                    }
                    else
                    {
                      balances[ currencyItem.symbol ].balance += parseFloat( currencyItem.value );
                    }
                    balances[ currencyItem.symbol ].addresses[ result.data.address ] = {
                      "address": result.data.address,
                      "value": currencyItem.value
                    };
                  } );
                }
                return result;
              },
              function( error ) {
                return error;
              } ));
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
  .directive( 'showWalletBalances', function( $compile ) {
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
/*    setTimeout( function() {
      console.log( 'Remove 13pm7cmA5vVpKkDLJCvqh26kcp6V6PJ1Aq' );
      $injector.get( 'userService' ).removeAddress( "13pm7cmA5vVpKkDLJCvqh26kcp6V6PJ1Aq", "NOPE!" );
      _.defer( $scope.showWalletBalances );
    }, 5000 );

    setTimeout( function() {
      console.log( 'Remove 1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW' );
      $injector.get( 'userService' ).removeAddress( "1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW", "NOPE!" );
      _.defer( $scope.showWalletBalances );
    }, 10000 );
*/
    $scope.openAddForm = function( currency ) {

      var modalInstance = $modal.open({
        templateUrl: '/partials/add_' + currency + '_address_modal.html',
        controller: AddBtcAddressModal
      });

    modalInstance.result.then(function ( result ) {
        console.log( result );
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

    $scope.showWalletBalances = function () {

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

var AddBtcAddressModal = function ($scope, $modalInstance ) {
  $scope.ok = function ( result ) {
    $modalInstance.close( result );
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};


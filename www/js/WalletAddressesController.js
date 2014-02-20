function PopoverDemoCtrl( $scope, $rootScope ) {
  $scope.content = "Hello, World!";
  $scope.title = "Title";

  console.log( '*** PopoverDemoCtrl!' );
};

var ModalDemoCtrl = function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: '/delete_address_modal.html',
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
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};

var count = 1;
angular.module( 'omniwallet' )
	.factory( 'wallet_balances_template', function () {
		return function () {
			return '<div><p ng-repeat="item in items">{{item}}</p></div>';
		};
	})
	.factory( 'wallet_balances_data', function () {
		return function () {
		// obviously would be $http
			var result = [];
			for( var i=0; i<count; i++ )
				result.push( i );
			count++;
			return result;
		};
	})
	.directive( 'showData', function( $compile ) {
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
	.controller( 'MyCtrl', function ( $scope, wallet_balances_data, wallet_balances_template ) {
		$scope.showContent = function () {
			$scope.items = wallet_balances_data(); 
			$scope.template = wallet_balances_template();
		};
	});

/*angular.module( 'omniwallet' ).directive( 'walletaddresslist', function( $rootScope, $injector, $http, $q, $compile ) {
	return {
		compile: function( $scope, parentElement ) {
			console.log( '+++ Scope: ' );
			console.log( $scope );
			console.log( '+++ elem: ' );
			console.log( parentElement );

			function getData( callback ) {
				console.log( '*** getData! ***' );
				if( $scope.wallet )
				{
					var requests = [];

					var balances = {};
					var currencyInfo;

					$scope.wallet.addresses.forEach( function( addr ) {
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
								balances[ item.currency ].name = item.name;
							});

							callback( balances );
						}
					} );
				}
				else
				{
					callback( {} );
				}			
			}

			$rootScope.$watch('userService.data', function(newVal, oldVal) {

				var wallet = $injector.get( 'userService' ).data;
				
				$scope.wallet = wallet;

				getData( function( result ) {
					console.log( '*** TODO: Reset the rendered output for for balances: ' );
					console.log( result );

					var resultTemplate = $compile( 
						angular.element( '<div>Rendered Data goes here!{{wallet}}</div>' ) );

					console.log( resultTemplate( $scope ) );
				});			
				
		   	}, true);
		} 
	};
});*/

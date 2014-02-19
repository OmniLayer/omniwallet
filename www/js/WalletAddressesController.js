function PopoverDemoCtrl( $scope, $rootScope ) {
  $scope.content = "Hello, World!";
  $scope.title = "Title";

  console.log( '*** PopoverDemoCtrl!' );
};

angular.module( 'omniwallet' ).controller( 'WalletAddressesController', 
	function($scope, $http , $q, $rootScope, $injector) {
	$rootScope.$watch('userService.data', function(newVal, oldVal) {

		var wallet = $injector.get( 'userService' ).data;
		_.defer( function() {
			$scope.wallet = wallet;
			$scope.$apply();
			console.log( '** Applied wallet: ' );
			console.log( wallet );
		} );

   	}, true);


	$scope.getData = function() {
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

					$scope.balances = balances;
				}
			} );
		}
		else
		{
			$scope.balances = {};
		}			
	}
} );
angular.module( 'omniwallet' ).directive( 'walletaddresslist', function() {
	console.log( 'Getting directive data.' );
	return {
		templateUrl: '/wallet_address_list.html'
	};
});

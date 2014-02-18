function WalletAddressesController($scope, $http , $q) {
	$scope.getWallet = function() {
		return {
			"uuid":"39cd5e05-aa4a-400c-c4c4-9fe70332bd01",
			"addresses":[ 
				"13pm7cmA5vVpKkDLJCvqh26kcp6V6PJ1Aq",
				"1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW"
			],
			"keys":[
				{
					"address":"13pm7cmA5vVpKkDLJCvqh26kcp6V6PJ1Aq",
					"encrypted":"NOPE!"
				},
				{
					"address":"1KRZKBqzcqa4agQbYwN5AuHsjvG9fSo2gW",
					"encrypted":"Still no!"
				}
			]
		};
	}
	$scope.getData = function() {
		var requests = [];
		var wallet = $scope.getWallet();

		var balances = {};
		var currencyInfo;

		if( wallet )
			wallet.addresses.forEach( function( addr ) {
				requests.push( $http.get( '/v1/address/addr/' + addr + '.json' ).then( function( result ) {
					if( result.status = 200 ) {
						result.data.balance.forEach( function( currencyItem ) {
							if( !balances.hasOwnProperty( currencyItem.symbol )) {
								balances[ currencyItem.symbol ] = {
									"balance": parseFloat( currencyItem.value ),
									"addresses": {}
								};
								balances[ currencyItem.symbol ].addresses[ result.data.address ] = currencyItem.value
							}
							else
							{
								balances[ currencyItem.symbol ].balance += parseFloat( currencyItem.value );
								balances[ currencyItem.symbol ].addresses[ result.data.address ] = currencyItem.value								
							}
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

				console.log( 'Balances:' );
				console.log( balances );
			}
		} );
	}
}
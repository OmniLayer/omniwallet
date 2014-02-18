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

		if( wallet )
			wallet.addresses.forEach( function( addr ) {
				requests.push( $http.get( '/v1/address/addr/' + addr + '.json' ).then( function( result ) {
					return result;
				},
				function( error ) {
					return error;
				} ));
			});
		$q.all( requests ).then( function( responses ) {
			console.log( 'Got responses!' );
			console.log( responses );
		} );
	}
}
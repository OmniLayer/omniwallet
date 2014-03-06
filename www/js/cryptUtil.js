var LOGIN_DIFFICULTY = '0400';
var CRYPT_LOOP_MAX = Math.pow( 2, 32 );
var CryptUtil = {
	// Returns an int nonce for which the HASH( CONCAT( nonce, pow_challenge )) ends with LOGIN_DIFFICULTY
	// Returns null (eventually) if this calculation fails.
	generateNonceForDifficulty: function( challengeString ) {
		var nonce = 0;
		while( ++ nonce < CRYPT_LOOP_MAX )
		{
			var hashBits = sjcl.hash.sha256.hash( nonce + challengeString );
			var hashString = sjcl.codec.hex.fromBits( hashBits );

			if( hashString.indexOf( LOGIN_DIFFICULTY, hashString.length - LOGIN_DIFFICULTY.length) !== -1 )
				return nonce;
		}
		return null;
	},
	generateKeyPair: function( password, salt ) {

	},
	createSignedObject: function( data ) {

	}
};
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
	// Returns a structure that includes a PEM-encoded public key for transmission to 
	//    the server, and an RSAKey object 
	//    (http://kjur.github.io/jsrsasign/api/symbols/RSAKey.html)
	//    representing the private key.
	generateAsymmetricPair: function() {
		var keyObj = KEYUTIL.generateKeypair( 'RSA', 1024 );

		return {
			pubPem: KEYUTIL.getPEM( keyObj.pubKeyObj ),
			privKey: keyObj.prvKeyObj
		}
	},
	// Returns a symmetric key which can be used to encrypt/decrypt wallets for storage on the server.
	generateSymmetricKey: function( password, hexSalt ) {
		var h = sjcl.codec.hex;
		var key = h.fromBits( sjcl.misc.pbkdf2( password, h.toBits( hexSalt ), 2048 ) ) ;
		return key;
	},
	// Returns a string that consists of the JSON representation of the given object, 
	//  encrypted using the given key.
	encryptObject: function( o, key ) {
		// TODO: Actually encrypt.
		return JSON.stringify( o );
	},
	// Returns a JSON object, given the provided encrypted JSON string.
	decryptObject: function( string, key ) {
		// TODO: Actually decrypt.
		return JSON.parse( string );
	},
	createSignedObject: function( data, privKey ) {
		return {
			data: data,
			signature: 'TODO: Signature goes here!'
		}
	}
};

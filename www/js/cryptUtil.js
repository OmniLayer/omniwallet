var LOGIN_DIFFICULTY = '0400';
var CRYPT_LOOP_MAX = Math.pow(2, 32);
var CryptUtil = {
  // Returns an int nonce for which the HASH( CONCAT( nonce, pow_challenge )) ends with LOGIN_DIFFICULTY
  // Returns null (eventually) if this calculation fails.
  generateNonceForDifficulty: function(challengeString) {
    var nonce = 0;
    while (++nonce < CRYPT_LOOP_MAX) {
      var hashBits = sjcl.hash.sha256.hash(challengeString + nonce);
      var hashString = sjcl.codec.hex.fromBits(hashBits);

      if (hashString.indexOf(LOGIN_DIFFICULTY, hashString.length - LOGIN_DIFFICULTY.length) !== -1)
        return nonce;
    }
    return null;
  },
  // Returns a structure that includes a PEM-encoded public key for transmission to 
  //    the server, and an RSAKey object 
  //    (http://kjur.github.io/jsrsasign/api/symbols/RSAKey.html)
  //    representing the private key.
  generateAsymmetricPair: function() {
    var keyObj = KEYUTIL.generateKeypair('RSA', 1024);

    return {
      pubPem: KEYUTIL.getPEM(keyObj.pubKeyObj),
      privKey: keyObj.prvKeyObj
    }
  },
  // Returns a symmetric key which can be used to encrypt/decrypt wallets for storage on the server.
  generateSymmetricKey: function(password, hexSalt) {
    return forge.pkcs5.pbkdf2(password, hexSalt, 2048, 16);
  },
  // Returns a string that consists of the JSON representation of the given object, 
  //  encrypted using the given key.
  encryptObject: function(o, key) {
    var inputBytes = forge.util.createBuffer(JSON.stringify(o));
    var encipher = forge.aes.createEncryptionCipher(key, 'CBC');
    encipher.start(key);
    encipher.update(inputBytes);
    encipher.finish();
    return encipher.output.toHex();
  },
  // Returns a JSON object, given the provided encrypted JSON string.
  decryptObject: function(string, key) {
    var inputBytes = forge.util.createBuffer(forge.util.hexToBytes(string));
    var decipher = forge.aes.createDecryptionCipher(key, 'CBC');
    decipher.start(key);
    decipher.update(inputBytes);
    decipher.finish();
    return JSON.parse(forge.util.decodeUtf8(decipher.output));
  },
  createSignedObject: function(data, privKey) {
    return privKey.signString(data, "sha1");
  }
};


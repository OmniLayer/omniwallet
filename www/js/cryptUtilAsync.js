// Thin wrapper for cryptUtil that utilizes a worker when available and 
// gracefully degrades if they are not available.
// 
// This allows the main thread to continue DOM processing while some of the
// more intensive processing happens in parallel.
if (typeof(window.Worker) !== 'undefined') {
  CryptUtilAsync = (function() {
    var cryptoWorker = new Worker("/js/cryptUtilWorker.js");
    // TODO: this is probably too simplified and could be made more robust if
    // the FIFO included some way of validating itself
    var submittedJobs = [];

    cryptoWorker.onmessage = function(oEvent) {
      var jobDef = submittedJobs.shift();
      jobDef.onComplete(oEvent.data);
    };

    cryptoWorker.onerror = function(oEvent) {
      var jobDef = submittedJobs.shift();
      jobDef.onComplete(null);
    };

    return {
      generateNonceForDifficulty: function(challengeString, onComplete) {
        submittedJobs.push({
          onComplete: onComplete
        })
        cryptoWorker.postMessage({
          name: 'generateNonceForDifficulty',
          challengeString: challengeString
        });
      },

      generateAsymmetricPair: function(onComplete) {
        submittedJobs.push({
          onComplete: function(result) {
            var keyObj = {
              pubPem: result.pubPem,
              privKey: KEYUTIL.getKey(result.privPem)
            };
            onComplete(keyObj);
          }
        });
        cryptoWorker.postMessage({
          name: 'generateAsymmetricPair'
        });
      },

      generateSymmetricKey: function(password, hexSalt, onComplete) {
        submittedJobs.push({
          onComplete: onComplete
        })
        cryptoWorker.postMessage({
          name: 'generateSymmetricKey',
          password: password,
          hexSalt: hexSalt
        });
      },

      encryptObject: function(o, key, onComplete) {
        submittedJobs.push({
          onComplete: onComplete
        })
        cryptoWorker.postMessage({
          name: 'encryptObject',
          o: o,
          key: key
        });
      },

      decryptObject: function(string, key, onComplete) {
        submittedJobs.push({
          onComplete: onComplete
        })
        cryptoWorker.postMessage({
          name: 'decryptObject',
          string: string,
          key: key
        });
      },

      createSignedObject: function(data, privKey, onComplete) {
        submittedJobs.push({
          onComplete: onComplete
        })
        cryptoWorker.postMessage({
          name: 'createSignedObject',
          data: data,
          privKey: privKey
        });
      }
    };
  })();
} else {
  // failover to delayed-synchronous processing if web workers are not present
  CryptUtilAsync = (function() {
    return {
      generateNonceForDifficulty: function(challengeString, onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.generateNonceForDifficulty(challengeString));
        }, 0);
      },

      generateAsymmetricPair: function(onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.generateAsymmetricPair());
        }, 0);
      },

      generateSymmetricKey: function(password, hexSalt, onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.generateSymmetricKey(password, hexSalt));
        }, 0);
      },

      encryptObject: function(o, key, onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.encryptObject(o, key));
        }, 0);
      },

      decryptObject: function(string, key, onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.decryptObject(string, key));
        }, 0);
      },

      createSignedObject: function(data, privKey, onComplete) {
        setTimeout(function() {
          onComplete(CryptUtil.createSignedObject(data, privKey));
        }, 0);
      }
    };
  })();
}


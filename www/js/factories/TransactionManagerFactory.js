angular.module("omniFactories")
    .factory("TransactionManager", ["$q", "userService", "TransactionGenerator", 
        function TransactionManagerFactory($q, userService, TransactionGenerator) {

            var TransactionManager = function(txType) {
                var self = this;

                self.initialize = function() {
                    self.txType = txType;
                }

                self.prepareData = function(rawdata, from) {
                    var addressData = userService.getAddress(from);
                    var pubKey = null;
                    if (addressData.pubkey)
                        pubKey = addressData.pubkey.toUpperCase();
                    else {
                        var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
                        pubKey = privKey.getPubKeyHex();
                    }
                    rawdata['pubkey'] = pubKey;
                    return rawdata; // followed by call to pushTransaction(data,pubkey);
                };

                self.prepareTransaction = function(unsignedTransactionHex, sourceScript) {

                    var bytes = Bitcoin.Util.hexToBytes(unsignedTransactionHex);
                    var transaction = Bitcoin.Transaction.deserialize(bytes);
                    var script = self.parseScript(sourceScript);

                    if (transaction.ins.length == 0) {
                        return {
                            waiting: false,
                            transactionError: true,
                            error: 'Error: Not enough inputs in the address!'
                        };
                    }
                    transaction.ins.forEach(function(input) {
                        input.script = script;
                    });
                }

                self.processTransaction = function(txData, signOffline) {
                    var deferred = $q.defer();
                    TransactionGenerator.getUnsignedTransaction(self.txType, txData).then(
                        function(successData) {
                            var successData = successData.data;
                            if (successData.status != 200 && successData.status != "OK") { /* Backwards compatibility for mastercoin-tools send API */
                                deferred.reject({
                                    waiting: false,
                                    transactionError: true,
                                    error: successData.error || successData.data, /* Backwards compatibility for mastercoin-tools send API */
                                    errorMessage: "Error preparing transaction"
                                });
                            } else {
                                self.prepareTransaction(successData.unsignedhex || successData.transaction, successData.sourceScript)
                                if (signOffline) {
                                    var parsedBytes = transaction.serialize();

                                    TransactionGenerator.getArmoryUnsigned(Bitcoin.Util.bytesToHex(parsedBytes), pubKey).then(function(result) {
                                        deferred.resolve({
                                            unsignedTransaction: result.data.armoryUnsigned,
                                            waiting: false,
                                            readyToSign: true,
                                            unsaved: true
                                        });
                                    }, function(errorData) {
                                        deferred.reject({
                                            waiting: false,
                                            transactionError: true,
                                            error: errorData.message || errorData.data || 'Unknown Error',
                                            errorMessage:'Server error'
                                        });
                                    });
                                } else {
                                    try {
                                        //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()));
                                        var signedSuccess = transaction.signWithKey(privKey);

                                        var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());

                                        //Showing the user the transaction hash doesn't work right now
                                        //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());

                                        TransactionGenerator.pushSignedTransaction(finalTransaction).then(
                                            function(successData) {
                                                var successData = successData.data;
                                                if (successData.pushed.match(/submitted|success/gi) != null) {
                                                    deferred.resolve({
                                                        waiting: false,
                                                        transactionSuccess: true,
                                                        url : 'http://blockchain.info/address/' + from + '?sort=0'
                                                    })
                                                } else {
                                                    deferred.reject({
                                                        waiting: false,
                                                        transactionError: true,
                                                        error: successData.pushed, //Unspecified error, show user}
                                                        errorMessage: "Invalid transaction"
                                                    })
                                                }
                                            },
                                            function(errorData) {
                                                deferred.reject({
                                                    waiting: false,
                                                    transactionError: true,
                                                    error: errorData.message || errorData.data || 'Unknown Server Error',
                                                    errorMessage:'Server error'
                                                })
                                            });

                                        //DEBUG console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );

                                    } catch (e) {
                                        deferred.reject({
                                            sendError: true,
                                            error: e.message || e.data || 'Unknown error',
                                            errorMessage:"Error sending transaction"
                                        })
                                    }
                                }
                            }
                        },
                        function(errorData) {
                            deferred.reject({
                                sendError: true,
                                error: errorData.message || errorData.data || 'Unknown Server Error',
                                errorMessage:'Server error'
                            })
                        });
                    return deferred.promise;
                };

                self.parseScript = function(script) {
                    var newScript = new Bitcoin.Script();
                    var s = script.split(" ");
                    for (var i = 0; i < s.length; i++) {
                        if (Bitcoin.Opcode.map.hasOwnProperty(s[i])) {
                            newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
                        } else {
                            newScript.writeBytes(Bitcoin.Util.hexToBytes(s[i]));
                        }
                    }
                    return newScript;
                }

                self.initialize();
            }

            return TransactionManager;
    }]);
angular.module("omniServices")
    .service("Account", ["$http", "$q", "Address","Wallet", function AccountService($http, $q, Address, Wallet) {
        var self = this;
        self.settings = {};

        function generateUUID() {
          var d = new Date().getTime();
          var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
          });
          return uuid;
        };


        self.verifyUUID = function(uuid) {
          //Check UUID for proper format
          verify = uuid.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89a-f][0-9a-f]{3}-[0-9a-f]{12}$/i) || []
          
          //Return false if it fails, true if its valid structure
          if (verify.length == 0) {
           return false;
          } else {
           return true;
          }
        };

        self.create = function(create){
            var create = $q.defer();
            if(!self.validating){
                self.uuid = generateUUID();
                var wallet = {
                  uuid: self.uuid,
                  addresses: []
                };
                var walletKey = '';
                var asymKey = {};
                self.validating=true;
                $http.get('/v1/user/wallet/challenge?uuid=' + uuid)
                  .then(function(result) {
                    var data = result.data;
                    self.nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
                    self.walletKey = CryptUtil.generateSymmetricKey(create.password, data.salt);
                    var encryptedWallet = CryptUtil.encryptObject(wallet, walletKey);
                    self.asymKey = CryptUtil.generateAsymmetricPair();
                    var createData = {
                        email: create.email,
                        nonce: self.nonce,
                        public_key: self.asymKey.pubPem,
                        uuid: self.uuid,
                        wallet: encryptedWallet
                      };

                    if(create.captcha){
                      angular.extend(createData, {
                        recaptcha_challenge_field:create.captcha.challenge,
                        recaptcha_response_field:create.captcha.response
                      })
                    };

                    return $http({
                      url: '/v1/user/wallet/create',
                      method: 'POST',
                      data: createData
                    });
                  })
                  .then(function(result) {
                    if(result.data.error =="InvalidCaptcha"){
                      
                      self.validating=false;
                      Recaptcha.reload();
                      create.reject({
                        invalidCaptcha : true
                      })
                    }else {
                      self.validating=false;

                      Wallet.initialize(wallet)
                      ga('send', 'event', 'button', 'click', 'Create Wallet');
                      create.resolve(self);
                    }
                  }, function(result) {
                    self.validating = false;
                    create.reject({
                        serverError : true
                    });
                  });
            }
            
            return create.promise;
        }

        self.login = function(uuid, passphrase) {
            var login = $q.defer()
            if (!self.loggedIn && !self.loginInProgress) {
            	self.loginInProgress = true;
                self.uuid = uuid;
                $http.get('/v1/user/wallet/challenge?uuid=' + uuid)
                    .then(function(result) {
                        var data = result.data;
                        var asyncCrypto = $q.defer();

                        // daisy chain several async crypto calls into a promise
                        CryptUtilAsync.generateNonceForDifficulty(data.pow_challenge, function(result) {
                            self.nonce = result;
                            CryptUtilAsync.generateSymmetricKey(passphrase, data.salt, function(result) {
                                self.walletKey = result;
                                CryptUtilAsync.generateAsymmetricPair(function(result) {
                                    self.asymKey = result;
                                    self.encodedPub = window.btoa(self.asymKey.pubPem);
                                    asyncCrypto.resolve();
                                });
                            });
                        });

                        return asyncCrypto.promise;
                    })
                    .then(function(result) {
                        return $http({
                            url: '/v1/user/wallet/login',
                            method: 'GET',
                            params: {
                                nonce: self.nonce,
                                public_key: self.encodedPub,
                                uuid: self.uuid
                            }
                        });
                    })
                    .then(function(result) {
                        var data = result.data;
                        try {
                            var wallet = CryptUtil.decryptObject(data, self.walletKey);
                            self.wallet = wallet;

                            // update wallet service
                            Wallet.initialize(wallet);

                            self.loggedIn = true;
                            self.loginInProgress = false;
                            login.resolve(self);
                        } catch (e) {
                        	self.loginInProgress = false;
                            login.reject(e);
                        }
                    }, function(result) {
                    	self.loginInProgress = false;
                        login.reject(result);
                    });
            } else {
                login.reject({error: "Login in progress or already loggedin"});
            }

            return login.promise;
        }

        self.logout = function(){
            self.uuid = null;
            self.walletKey = null;
            self.asymKey = null;
            self.wallet = null;
            self.addresses = null;
            self.assets = null;
            self.loggedIn = false;
        }

        self.saveSession = function() {
            if(self.loggedIn){
                return $http.get('/v1/user/wallet/challenge?uuid=' + self.uuid)
                .then(function(result) {
                  var data = result.data;
                  var encryptedWallet = CryptUtil.encryptObject(self.wallet, self.walletKey);
                  var challenge = data.challenge;
                  var signature = CryptUtil.createSignedObject(challenge, self.asymKey.privKey);
    
                  return $http({
                    url: '/v1/user/wallet/update',
                    method: 'POST',
                    data: {
                      uuid: uuid,
                      wallet: encryptedWallet,
                      signature: signature
                    }
                  });
                }).then(function(result) {
                  console.log("Success saving");
                }, function(result) {
                  console.log("Failure saving");
                  location = location.origin + '/loginfs/' + self.uuid;
                  self.logout();
                });
            }
        }

        self.addAddress = function(address, privKey, pubKey) {
            for (var i in self.wallet.addresses) {
              if (self.wallet.addresses[i].address == address) {
                if(privKey)
                  self.wallet.addresses[i].privkey = privKey;
                if(pubKey)
                  self.wallet.addresses[i].pubkey = pubKey;
                return self.saveSession().then(function(){
                    Wallet._updateAddress(address,privKey,pubKey);
                });
              }
            }

            var rawaddress = {
              "address": address,
              "privkey": privKey,
              "pubkey": pubKey 
            }

            self.wallet.addresses.push(rawaddress);
            
            return self.saveSession().then(function(){
                Wallet._addAddress(rawaddress);
            });
        };

          
        self.removeAddress = function(addressHash) {
            for (var i = 0; i < self.wallet.addresses.length; i++)
              if (self.wallet.addresses[i].address == addressHash) {
                var remove = self.wallet.addresses.splice(i, 1);
                return self.saveSession().then(function(){
                    Wallet._removeAddress(remove.address);
                });
              }
        };

      
    }]);
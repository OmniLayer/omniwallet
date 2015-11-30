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

        self.create = function(form){
            var create = $q.defer();
            if(!self.validating){
                self.uuid = generateUUID();
                if (form.email == undefined) {
                  uemail = ""
                } else {
                  uemail = form.email
                }
                var wallet = {
                  uuid: self.uuid,
                  addresses: [],
                  email: uemail
                };
                var walletKey = '';
                var asymKey = {};
                self.validating=true;
                $http.get('/v1/user/wallet/challenge?uuid=' + self.uuid)
                  .then(function(result) {
                    var data = result.data;
                    self.nonce = CryptUtil.generateNonceForDifficulty(data.pow_challenge);
                    self.walletKey = CryptUtil.generateSymmetricKey(form.password, data.salt);
                    var encryptedWallet = CryptUtil.encryptObject(wallet, self.walletKey);
                    self.asymKey = CryptUtil.generateAsymmetricPair();
                    var createData = {
                        email: form.email,
                        nonce: self.nonce,
                        public_key: self.asymKey.pubPem,
                        uuid: self.uuid,
                        wallet: encryptedWallet
                      };

                    if(form.captcha){
                      angular.extend(createData, {
                        recaptcha_challenge_field:form.captcha.challenge,
                        recaptcha_response_field:form.captcha.response
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
                        invalidCaptcha : true,
                        validating : false
                      })
                    }else {
                      self.validating=false;
                      self.settings.firstLogin = true;
                      self.wallet = wallet;
                      Wallet.initialize(wallet);

                      ga('send', 'event', 'button', 'click', 'Create Wallet');
                      self.loggedIn = true;
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

        self.verify = function(uuid,passphrase){
          return $http.get('/v1/user/wallet/challenge?uuid=' + uuid)
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
                    });
        }

        self.login = function(uuid, passphrase) {
            var login = $q.defer()
            if (!self.loginInProgress) {
            	self.loginInProgress = true;
                self.uuid = uuid;
                self.verify(uuid,passphrase)
                    .then(function(result) {
                        var data = result.data;
                        try {
                            var wallet = CryptUtil.decryptObject(data, self.walletKey);
                            self.wallet = wallet;
                            self.settings.firstLogin=false;
                            // update wallet service
                            Wallet.initialize(wallet);

                            self.loggedIn = true;
                            self.loginInProgress = false;
                            self.setCurrencySymbol(self.getSetting('usercurrency'));
                            login.resolve(wallet);
                        } catch (e) {
                        	self.loginInProgress = false;
                          login.reject({badPassword : true});
                        }
                    }, function(result) {
                    	self.loginInProgress = false;
                      if (result.status == 403) {
                        login.reject({missingUUID : true});
                      } else {
                        login.reject({serverError : true});
                      }
                        
                    });
            } else {
                login.reject({error: "Login in progress"});
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
            Wallet.destroy();
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
                      uuid: self.uuid,
                      wallet: encryptedWallet,
                      signature: signature,
                      email: self.getSetting("email")
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
                if(privKey){
                  self.wallet.addresses[i].privkey = privKey;
                  self.wallet.addresses[i].pubkey = undefined;
                }
                if(pubKey){
                  if(self.wallet.addresses[i].privkey)
                    throw "Address " + address + " has already a private key."

                  self.wallet.addresses[i].pubkey = pubKey;
                }
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
                var remove = self.wallet.addresses.splice(i, 1)[0];
                return self.saveSession().then(function(){
                    Wallet._removeAddress(remove.address);
                });
              }
        };

        self.setCurrencySymbol = function(currency){

          csym = '$'

          switch (currency) {

            case "AUD":
            case "CAD":
            case "NZD":
            case "MXN":
            case "SGD":
            case "USD":
              csym = '$'
              break;

            case "EUR":
              csym= '€'
              break;

            case "CHF":
              csym = 'CHF'
              break;

            case "IDR":
              csym = 'Rp'
              break;

            case "ILS":
              csym = '₪'
              break;

            case "TRY":
              csym = '&#8378;'
              break;

            case "NOK":
            case "SEK":
              csym = 'kr'
              break;

            case "BRL":
              csym = 'R$'
              break;

            case "ZAR":
              csym = 'R'
              break;

            case "HKD":
              csym = 'HK$'
              break;

            case "RUB":
              csym = '&#8381;'
              break;

            case "GBP":
              csym = '£'
              break;

            case "RON":
              csym = 'lei'
              break;

            case "CNY":
              csym='¥'
              break;

            case "PLN":
              csym='zł'
              break;

            case "JPY":
              csym='&#165'
              break;

            default:
              csym = '&#164;'
              break;
          }


          numeral.language('en', {
            delimiters: {
              thousands: ',',
              decimal: '.'
            },
            abbreviations: {
              thousand: 'k',
              million: 'm',
              billion: 'b',
              trillion: 't'
            },
            ordinal : function (number) {
              return number === 1 ? 'er' : 'ème';
            },
            currency: {
              symbol: csym
            }
          });
        };

        self.getSetting = function(name){

            if (self.wallet.settings == undefined) {
                settings = []
            } else {
                settings=self.wallet.settings
            }
            retval="";

            switch (name) {

            case "email":
              if (self.wallet.email == undefined) {
                retval = ""
              } else {
                retval = self.wallet.email
              }
              break;

            case "donate":
              //if (settings['donate'] == undefined) {
              //  retval = 'false'
              //} else {
              //  retval = settings['donate']
              //}
              //disable all donate options for now
              retval = 'false'
              break;

            case "usercurrency":
              if (settings['usercurrency'] == undefined) {
                retval = "USD"
              } else {
                retval = settings['usercurrency']
              }
              break;

            case "filterdexdust":
              if (settings['filterdexdust'] == undefined) {
                retval = 'true'
              } else {
                retval = settings['filterdexdust']
              }
              break;

            case "showtesteco":
              if (settings['showtesteco'] == undefined) {
                retval = 'false'
              } else {
                retval = settings['showtesteco']
              }
              break;

            }
            //console.log(retval);
            return retval;
        }
      
    }]);

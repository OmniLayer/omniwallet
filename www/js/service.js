//global services go here
angular.module('omniwallet').factory('propertiesService',['$http',function($http){
  var service = {
    list : function(ecosystem) {
      var url = '/v1/properties/list';
      var data = {
        ecosystem: ecosystem
      };
      var promise = $http.post(url, data);
      return promise;
    },
    
    loadCategories:function(ecosystem) {
      var url = '/v1/properties/categories';
      var data = {
        ecosystem: ecosystem
      };
      var promise = $http.post(url, data);
      return promise;
    },
  
    loadSubcategories:function(ecosystem,category) {
      var url = '/v1/properties/subcategories';
      var data = {
        ecosystem: ecosystem,
        category: category
      };
      var promise = $http.post(url, data);
      return promise;
    }
  };
  
  return service;
  
}]);

angular.module('omniwallet').factory('walletTransactionService',['$http',function($http){
  var service = {
    pushSignedTransaction : function(signedTransaction) {
      var url = '/v1/transaction/pushtx/';
      var data = {
        signedTransaction: signedTransaction
      };
      var promise = $http.post(url, data);
      return promise;
    },
    
    getUnsignedTransaction : function(type, data){
      if (type == 0 && data.currency_identifier == 0){
        btc_send_data = {
          'from_address':data.pubkey, 'to_address':data.transaction_to, 'amount':data.amount_to_transfer, 'currency':'BTC', 'fee':data.fee,'marker': (data.marker || false)
        };
        var url = '/v1/transaction/send/';
        
        var promise = $http.post(url, btc_send_data);
        return promise;
      }else{
        var url = '/v1/transaction/getunsigned/'+type;
        
        var promise = $http.post(url, data);
        return promise;
      } 
    },
    
    validAddress:function(addr) {
      try {
        var checkValid = new Bitcoin.Address(addr);
        return true;
      } catch (e) {
        return false;
      }
    },
  
    getAddressData:function(address) {
      console.log('Addr request 5');
      var promise = $http.post('/v1/address/addr/', {
        'addr': address
      });
  
      return promise;
    }
  };
  
  return service;
  
}]);

angular.module('omniwallet').factory('balanceService', ['$http', '$q', function($http, $q) {
    var cache = [];
    var service = {
      balance: function(address) {
        var currentTime = new Date().getTime();
        if (cache[address] && (currentTime - cache[address].timestamp) < 60000)
          return cache[address].deferred.promise; else {
          var deferred = $q.defer();
          cache[address] = {
            deferred: deferred,
            timestamp: currentTime
          };
          $http.post('/v1/address/addr/', {
              'addr': address
            })
            .success(function(result) {
              deferred.resolve({
                data: result
              });
            }).error (function(error) {
            deferred.resolve({
              data: {
                address: address,
                balance: []
              }
            });
          });
          return deferred.promise;
        }
      }
    };
    return service;
  }
]);

angular.module('omniwallet').factory('userService', ['$rootScope', '$http', '$injector', '$q', '$idle', function($rootScope, $http, $injector, $q, $idle) {
    var service = {
      data: {
        walletKey: '',
        asymKey: {},
        wallet: {},
        walletMetadata: {
          currencies: []
        },
        loggedIn: false,
        disclaimerSeen: false
      },

      login: function(wallet, walletKey, asymKey, walletMetadata) {
        service.data.walletKey = walletKey;
        service.data.asymKey = asymKey;
        service.data.wallet = wallet;
        service.data.walletMetadata = walletMetadata || service.data.walletMetadata;
        service.data.loggedIn = true;
        service.UpdateLoop();
        
        $idle.watch();
      },

      logout: function() {
        service.data.loggedIn = false;
        service.data.wallet = {};
        service.data.walletMetadata = {};
      },

      addAddress: function(address, privKey) {
        for (var i in service.data.wallet.addresses) {
          if (service.data.wallet.addresses[i].address == address) {
            if(privKey)
              service.data.wallet.addresses[i].privkey = privKey;
            return service.saveSession();
          }
        }

        service.data.wallet.addresses.push({
          "address": address,
          "privkey": privKey
        });
        service.data.loggedIn = true;
        return service.saveSession().then(function(){
          service.updateCurrencies();
        });
      },

      getAddress: function(address) {
        for (var i in service.data.wallet.addresses) {
          if (service.data.wallet.addresses[i].address == address) {
            return service.data.wallet.addresses[i];
          }
        }
      },

      getAllAddresses: function() {
        return service.data.wallet.addresses;
      },
      
      getAddressesWithPrivkey: function(addressFilter) {
        var addresses = service.data.wallet.addresses.filter(function(e) {
          return e.privkey && e.privkey.length == 58;
        }).map(function(e){
          return e.address;
        });
        
        if (addresses.length == 0)
          addresses = ['Could not find any addresses with attached private keys!'];
        else {
          
          if(addressFilter){
            addresses = addresses.filter(function(e) {
              return addressFilter.indexOf(e) > -1;
            });
            if (addresses.length == 0)
              addresses = ['You have no addresses with a balance on the selected coin!'];
          }
        }
        
        return addresses;
      },

      getCurrencies: function() {
        return service.data.walletMetadata.currencies;
      },

      getWallet: function() {
        return service.data.wallet;
      },

      getUUID: function() {
        return service.data.wallet.uuid;
      },

      getAsymKey: function() {
        return service.data.asymKey;
      },

      removeAddress: function(address) {
        for (var i = 0; i < service.data.wallet.addresses.length; i++)
          if (service.data.wallet.addresses[i].address == address) {
            service.data.wallet.addresses.splice(i, 1);
            service.saveSession();
            return;
        }
      },

      loggedIn: function() {
        return service.data.loggedIn;
      },

      UpdateLoop: function() {
        service.updateMetadata(function() {
          setTimeout(service.UpdateLoop, 300000);
        });
      },

      updateWallet: function() {
        var uuid = service.getUUID();
        return $http.get('/v1/user/wallet/challenge?uuid=' + uuid)
        .then(function(result) {
          var data = result.data;
          var encryptedWallet = CryptUtil.encryptObject(service.data.wallet, service.data.walletKey);
          var challenge = data.challenge;
          var signature = CryptUtil.createSignedObject(challenge, service.getAsymKey().privKey);

          return $http({
            url: '/v1/user/wallet/update',
            method: 'POST',
            data: {
              uuid: uuid,
              wallet: encryptedWallet,
              signature: signature
            }
          });
        });
      },

      updateCurrencies: function() {
        var addCurrencies = function(i) {
          if (i < service.data.wallet.addresses.length) {
            $injector.get('balanceService').balance(service.data.wallet.addresses[i].address).then(function(result) {
              result.data.balance.forEach(function(balanceItem) {
                var address = service.data.wallet.addresses[i];
                var tradable = address.privkey && address.privkey.length == 58 && balanceItem.value > 0;
                var currency = null;
                for (var j = 0; j < service.data.walletMetadata.currencies.length; j++) {
                  var currencyItem = service.data.walletMetadata.currencies[j];
                  if (currencyItem.symbol == balanceItem.symbol) {
                    currency = currencyItem;
                    if (currency.addresses().indexOf(service.data.wallet.addresses[i].address) == -1){
                     balanceItem.value > 0 ? currency.tradableAddresses.push(service.data.wallet.addresses[i].address) : currency.watchAddresses.push(service.data.wallet.addresses[i].address) ;
                     currency.tradable = currency.tradable || tradable;
                    }
                    break;
                  }
                }
                if (currency === null) {
                  if (balanceItem.symbol.substring(0, 2) == "SP") {
                    var propertyID = balanceItem.symbol.substring(2);
                    currency = {
                        id: propertyID,
                        symbol: balanceItem.symbol,
                        divisible: balanceItem.divisible,
                        tradableAddresses: balanceItem.value > 0 ? [service.data.wallet.addresses[i].address] : [],
                        watchAddresses: balanceItem.value == 0 ? [service.data.wallet.addresses[i].address] : [],
                        addresses: function(){ return this.tradableAddresses.concat(this.watchAddresses); },
                        tradable:tradable
                      };
                    service.data.walletMetadata.currencies.push(currency);
                    
                    $http.get('/v1/property/' + propertyID + '.json').then(function(result) {
                      var property = result.data[0];
                      currency["name"] = property.propertyName;
                      currency["property_type"] = property.formatted_property_type;
                    });
                  } else {
                    currency = {
                      id: balanceItem.symbol == "BTC" ? 0 : balanceItem.symbol == "MSC" ? 1 :balanceItem.symbol == "TMSC" ? 2 : null,
                      name: balanceItem.symbol,
                      symbol: balanceItem.symbol,
                      divisible: balanceItem.divisible,
                      tradableAddresses: balanceItem.value > 0 ? [service.data.wallet.addresses[i].address] : [],
                      watchAddresses: balanceItem.value == 0 ? [service.data.wallet.addresses[i].address] : [],
                      addresses: function(){ return this.tradableAddresses.concat(this.watchAddresses); },
                      tradable:tradable
                    };
                    service.data.walletMetadata.currencies.push(currency);
                  }
                }
              });
              addCurrencies(i + 1);
            });
          } else {
	    $injector.get('appraiser').updateValues(function() {
                console.log("Updated Currencies");
            });
          }
        };
        addCurrencies(0);
      },

      updateMetadata: function(callback) {
        service.updateCurrencies();
        callback();
      },

      saveSession: function() {
        return service.updateWallet().then(function(result) {
          console.log("Success saving");
        }, function(result) {
          console.log("Failure saving");
          location = location.origin + '/loginfs/' + service.getUUID()
          service.logout();
        });
      }
    };

    return service;
  }]);

angular.module('omniwallet').factory('appraiser', ['$rootScope', '$http', '$q', '$injector', function($rootScope, $http, $q, $injector) {

    function AppraiserService() {
      this.conversions = {};
      this.userService = $injector.get('userService');
      var self = this;
      function UpdateLoop() {
        self.updateValues(function() {
          setTimeout(UpdateLoop, 300000);
        });
      }
      UpdateLoop();
    };
    AppraiserService.prototype.updateValues = function(callback) {
      var self = this;
      var requests = [];
      var coins = this.userService.getCurrencies();
      coins.forEach(function(coin) {
        requests.push(
        $http.get('/v1/values/' + coin.symbol + '.json').then(function(response) {
          var currency = response.data[0];
          if (currency.symbol == 'BTC') {
            // Store these things internally as the value of a satoshi.
            self.conversions.BTC = currency.price / 100000000;
            $rootScope.$emit('APPRAISER_VALUE_CHANGED', 'BTC');
          } else {
            self.conversions[currency.symbol] = currency.price;
            $rootScope.$emit('APPRAISER_VALUE_CHANGED', currency.symbol);
          }
        }, function(error) {
          console.log(error);
        })
        );
      });
      $q.all(requests).then(function(responses) {
        callback();
      });
    };
    AppraiserService.prototype.updateValue = function(callback, symbol) {
      var self = this;      
      if (symbol === 'BTC' || this.conversions.BTC) {
        $http.get('/v1/values/' + symbol + '.json').then(function(response) {
          var currency = response.data[0];
          if (currency.symbol == 'BTC') {
            // Store these things internally as the value of a satoshi.
            self.conversions.BTC = currency.price / 100000000;
          } else if (currency.symbol) {
            self.conversions[currency.symbol] = currency.price;
          }
          callback();
        }, function(error) {
          console.log(error);

          self.conversions[symbol] = 0;
          callback();
        });
      }
      else {
	this.updateValue(function() {
          self.updateValue(callback, symbol);
	}, 'BTC');
      }
    };
    AppraiserService.prototype.getValue = function(amount, symbol, divisible) {
      if (symbol == 'BTC') {
        if (this.conversions.BTC)
          return this.conversions.BTC * amount;
        else
          return 'BTC Value Unavailable';
      } else {        
        if (this.conversions.hasOwnProperty(symbol)) {
          if (divisible)
            return this.getValue(this.conversions[symbol] * amount, 'BTC', true);
          else
            return this.getValue(this.conversions[symbol] * amount * 100000000, 'BTC', true);
        } else
          return symbol + ' Value Unavailable';
      }
    };

    return new AppraiserService();
  }]);

angular.module('omniwallet').factory('hashExplorer', function() {
  var tx = '',
    loc = '',
    search = '',
    getHash = function() {},
    setHash = function() {};
  return {
    tx: tx,
    loc: loc,
    search: search,
    setSearch: function(query) { this.search = query; },
    setHash: function(tx) {
      this.tx = JSON.stringify(tx);
      this.loc = window.location.href.split('/').slice(-2).join('/');
    }
  };
});

angular.module('omniwallet').factory('browser', ['$window', function($window) {
    var userAgent = $window.navigator.userAgent;

    var browsers = {
      chrome: /chrome/i,
      safari: /safari/i,
      firefox: /firefox/i,
      ie: /internet explorer/i
    };

    for (var key in browsers) {
      if (browsers[key].test(userAgent)) {
        return key;
      }
    }
  }]);


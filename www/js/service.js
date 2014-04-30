//global services go here
angular.module('omniwallet').factory( 'balanceService', [ '$http', '$q',
  function( $http, $q ) {
    var cache = [];
    var service = {
      balance: function( address ) {
        var currentTime = new Date().getTime();
        if( cache[ address ] && ( currentTime - cache[ address ].timestamp ) < 60000 )
          return cache[ address ].deferred.promise;
        else
        {
          var deferred = $q.defer();
          cache[ address ] = {
            deferred: deferred,
            timestamp: currentTime
          }
          $http.post( '/v1/address/addr/', { 'addr': address } )
            .success( function( result ) {
              deferred.resolve( { data: result } );
            }).error ( function( error ) {
              deferred.resolve( {
                data: { 
                  address: address,
                  balance: []
                }
              } );
            } );
          return deferred.promise;
        }
      }
    };
    return service;
  }
] );

angular.module('omniwallet').factory('userService', ['$rootScope', '$http', '$injector',
function($rootScope, $http, $injector) {
  var service = {
    data : {
      walletKey : '',
      asymKey : {},
      wallet : {},
      walletMetadata: { currencies : [] },
      loggedIn : false,
      disclaimerSeen : false
    },

    login : function(wallet, walletKey, asymKey, walletMetadata) {
      service.data.walletKey = walletKey;
      service.data.asymKey = asymKey;
      service.data.wallet = wallet;
      service.data.walletMetadata = walletMetadata || service.data.walletMetadata;
      service.data.loggedIn = true;
      service.UpdateLoop();
    },

    logout : function() {
      service.data.loggedIn = false;
      service.data.wallet = {}
      service.data.walletMetadata = {}
    },

    addAddress : function(address, privKey) {
      for (var i in service.data.wallet.addresses ) {
        if (service.data.wallet.addresses[i].address == address) {
          service.data.wallet.addresses[i].privkey = privKey;
          service.saveSession();
          return;
        }
      };
      service.data.wallet.addresses.push({
        "address" : address,
        "privkey" : privKey
      });
      service.data.loggedIn = true;
      service.saveSession();
      service.updateCurrencies();
    },

    getAddress : function(address) {
      for (var i in service.data.wallet.addresses) {
        if (service.data.wallet.addresses[i].address == address) {
          return service.data.wallet.addresses[i];
        }
      }
    },

    getAllAddresses : function() {
      return service.data.wallet.addresses;
    },

    getCurrencies : function() {
      return service.data.walletMetadata.currencies;
    },

    getWallet : function() {
      return service.data.wallet;
    },

    getUUID : function() {
      return service.data.wallet.uuid;
    },

    getAsymKey: function() {
      return service.data.asymKey;
    },

    removeAddress: function( address ) {
      for( var i=0; i<service.data.wallet.addresses.length; i++ )
        if( service.data.wallet.addresses[i].address == address )
        {
          service.data.wallet.addresses.splice( i, 1 );
          service.saveSession();
          return;
        }
    },

    loggedIn: function () {
      return service.data.loggedIn;
    },
    
    UpdateLoop : function() {
      service.updateMetadata(function() {
        setTimeout(service.UpdateLoop, 60000);
      });
    },

    updateWallet: function() {
      var uuid = service.getUUID();
      return $http.get('/v1/user/wallet/challenge?uuid='+uuid)
        .then(function(result) {
          var data = result.data;
          var encryptedWallet = CryptUtil.encryptObject(service.data.wallet, service.data.walletKey);
          var challenge = data.challenge;
          var signature = CryptUtil.createSignedObject(challenge, service.getAsymKey().privKey);

          return $http({
            url: '/v1/user/wallet/update',
            method: 'POST',
            data: { uuid: uuid, wallet: encryptedWallet, signature: signature }
          });
        });
    },
    
    updateCurrencies : function(){
      var addCurrencies = function(i) {
        if (i < service.data.wallet.addresses.length) {
          $injector.get( 'balanceService' ).balance( service.data.wallet.addresses[i].address ).then(function(result) {
            result.data.balance.forEach(function(balanceItem) {
              var currency = null;
              for( var j = 0; j<service.data.walletMetadata.currencies.length; j++ ) {
                var currencyItem = service.data.walletMetadata.currencies[j];
                if(currencyItem.symbol == balanceItem.symbol) {
                  currency = currencyItem;
                  if(currency.addresses.indexOf(service.data.wallet.addresses[i].address) == -1)
                    currency.addresses.push(service.data.wallet.addresses[i].address);
                  break;
                }
              }
              if (currency === null){
                if(balanceItem.symbol.substring(0,2) == "SP"){
                  var propertyID = balanceItem.symbol.substring(2);
                  $http.get('/v1/property/'+propertyID+'.json').then(function(result){
                    var property = result.data[0];
                    currency = { 
                      name: property.propertyName, 
                      symbol : balanceItem.symbol, 
                      property_type: property.formatted_property_type,
                      addresses : [service.data.wallet.addresses[i].address]
                    };
                    service.data.walletMetadata.currencies.push(currency);
                  });
                } else {
                  currency = { name: balanceItem.symbol, symbol : balanceItem.symbol, addresses : [service.data.wallet.addresses[i].address]};
                  service.data.walletMetadata.currencies.push(currency);
                }
              }
            });
            addCurrencies(i+1);
          });
        } else {
          console.log("Updated Currencies");
        }
      };
      addCurrencies(0);
    },

    updateMetadata : function(callback){
      service.updateCurrencies();
      callback();  
    },
    
    saveSession: function () {
      service.updateWallet().then(function(result) {
        console.log("Success saving")
      },
      function(result) {
        console.log('Failure saving')
      });
    }
  };

  return service;
}]);

angular.module('omniwallet').factory('appraiser', ['$rootScope', '$http','$q', '$injector',
function($rootScope, $http,$q, $injector) {

  function AppraiserService() {
    this.conversions = {};
    this.userService = $injector.get( 'userService' );
    var self = this;
    function UpdateLoop() {
      self.updateValues(function() {
        setTimeout(UpdateLoop, 30000);
      });
    }

    UpdateLoop();
  };
  AppraiserService.prototype.updateValues = function(callback) {
    var self = this;
    var requests =[];
    var coins = this.userService.getCurrencies();
    coins.forEach(function(coin){
      requests.push(
        $http.get('/v1/values/'+coin.symbol+'.json').then(function(response) {
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
    $q.all( requests ).then(function(responses){
      callback();
    });
  };
  AppraiserService.prototype.getValue = function(amount, symbol) {
    if (symbol == 'BTC') {
      if (this.conversions.BTC)
        return this.conversions.BTC * amount;
      else
        return 'BTC Value Unavailable';
    } else {
      if (this.conversions.hasOwnProperty(symbol)) {
        return this.getValue(this.conversions[symbol] * amount, 'BTC');
      } else
        return symbol + ' Value Unavailable';
    }
  };

  return new AppraiserService();
}]);

angular.module('omniwallet').factory( 'hashExplorer', function ( ) {
  var tx = '', loc = '', setHash = function(){}; 
  return {
    tx : tx,
    loc: loc,
    setHash: function(tx) {
      this.tx = JSON.stringify(tx);
      this.loc = window.location.href.split('/').slice(-2).join('/');
    }
  }
});

angular.module('omniwallet').factory( 'browser', ['$window', function ($window) {
  var userAgent = $window.navigator.userAgent;

  var browsers = {chrome: /chrome/i, safari: /safari/i, firefox: /firefox/i, ie: /internet explorer/i};

  for(var key in browsers) {
    if (browsers[key].test(userAgent)) {
      return key;
    }
  }
}]);

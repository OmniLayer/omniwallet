//global services go here
angular.module('omniwallet').factory('userService', ['$rootScope', '$http',
function($rootScope, $http) {
  var service = {
    data : {
      walletKey : '',
      asymKey : {},
      wallet : {},
      walletMetadata: { currencies : [] },
      loggedIn : false
    },

    login : function(wallet, walletKey, asymKey, walletMetadata) {
      service.data.walletKey = walletKey;
      service.data.asymKey = asymKey;
      service.data.wallet = wallet;
      service.data.walletMetadata = walletMetadata || service.data.walletMetadata;
      service.data.loggedIn = true;
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
      currencies = service.data.walletMetadata.currencies.map( function( currency ) {
        return currency.symbol;
      });
      return currencies;
    },

    getWallet : function() {
      return service.data.wallet;
    },

    getUUID : function() {
      return service.data.wallet.uuid;
    },

    removeAddress : function(address) {
      for (var i = 0; i < service.data.wallet.addresses.length; i++)
        if (service.data.wallet.addresses[i].address == address) {
          service.data.wallet.addresses.splice(i, 1);
          service.saveSession();
          return;
        }
    },

    updateWallet : function() {
      var uuid = service.getUUID();
      return $http.get('/v1/user/wallet/challenge?uuid=' + uuid).then(function(result) {
        var data = result.data;
        var encryptedWallet = CryptUtil.encryptObject(service.data.wallet, service.data.walletKey);
        var challenge = data.challenge;
        var signature = ""

        return $http({
          url : '/v1/user/wallet/update',
          method : 'POST',
          data : {
            uuid : uuid,
            wallet : encryptedWallet,
            challenge : challenge,
            signature : signature
          }
        });
      });
    },

    saveSession : function() {
      service.updateWallet().then(function() {
        console.log("Success saving")
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
    coins.forEach(function(symbol){
      requests.push(
        $http.get('/v1/values/'+symbol+'.json').then(function(response) {
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

angular.module( 'omniwallet' ).factory( 'hashExplorer', function ( ) {
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

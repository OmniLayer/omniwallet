//global services go here
angular.module( 'omniwallet' ).factory('userService', ['$rootScope', '$http', function ($rootScope, $http) {
  var service = {
    data: {
      walletKey: '',
      asymKey: {},
      wallet : {},
      loggedIn: false
    },

    login: function(wallet, walletKey, asymKey) {
      service.data.walletKey = walletKey;
      service.data.asymKey = asymKey;
      service.data.wallet = wallet;
      service.data.loggedIn = true;
    },

    logout: function() {
      service.data.loggedIn = false;
      service.data.wallet = {}
    },

    addAddress: function( address, privKey ) {
      for( var i in service.data.wallet.addresses )
      {
        if( service.data.wallet.addresses[i].address == address )
        {
          service.data.wallet.addresses[i].privkey = privKey;
          service.saveSession();
          return;
        }
      }
      service.data.wallet.addresses.push( {
        "address": address,
        "privkey": privKey
      });
      service.data.loggedIn = true;
      service.saveSession();
    },

    getAddress: function(address) {
      for(var i in service.data.wallet.addresses) {
        if(service.data.wallet.addresses[i].address == address) {
          return service.data.wallet.addresses[i];
        }
      }
    },

    getAllAddresses: function () {
      return service.data.wallet.addresses;
    },

    getWallet: function() {
      return service.data.wallet;
    },

    getUUID: function() {
      return service.data.wallet.uuid;
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

    updateWallet: function() {
      var uuid = service.getUUID();
      return $http.get('/v1/user/wallet/challenge?uuid='+uuid)
        .then(function(result) {
          var data = result.data;
          var encryptedWallet = CryptUtil.encryptObject(service.data.wallet, service.data.walletKey);
          var challenge = data.challenge;
          var signature = ""

          return $http({
            url: '/v1/user/wallet/update',
            method: 'POST',
            data: { uuid: uuid, wallet: encryptedWallet, challenge: challenge, signature: signature }
          });
        })
    },

    saveSession: function () {
      service.updateWallet().then(function() { console.log("Success saving") });
    }
  };

  return service;
}]);

angular.module( 'omniwallet' ).factory( 'appraiser', ['$rootScope', '$http', function ( $rootScope, $http ) {

  function AppraiserService() {
    this.conversions = {};
    var self = this;
    function BtcUpdateLoop() {
      self.updateBtcValue( function() {
        setTimeout( BtcUpdateLoop, 30000 );
      } );
    }
    function MscUpdateLoop() {
      self.updateMscValue( function() {
        setTimeout( MscUpdateLoop, 600000 );
      } );
    }
    BtcUpdateLoop();
    MscUpdateLoop();
  };
  AppraiserService.prototype.updateBtcValue = function( callback ) {
    var self = this;
    $http.get( 'https://api.bitcoinaverage.com/all' ).then( function( result ) {
      // Store these things internally as the value of a satoshi.
      self.conversions.BTC = result.data.USD.averages.last / 100000000;
      $rootScope.$emit( 'APPRAISER_VALUE_CHANGED', 'BTC' );
      callback();
    }, function( error ) {
      console.log( error );
      callback();
    });
  };
  AppraiserService.prototype.updateMscValue = function( callback ) {
    var self = this;
    $http.get( 'https://masterxchange.com/api/trades.php' ).then( function( result ) {
      var volume = 0;
      var sum = 0;

      for( var i=0; i<result.data.length; i++ )
      {
        volume += parseFloat( result.data[i].amount );
        sum += parseFloat( result.data[i].amount ) * parseFloat( result.data[i].price );
      }

      self.conversions.MSC = sum / volume;
      $rootScope.$emit( 'APPRAISER_VALUE_CHANGED', 'MSC' );
      callback();
    }, function( error ) {
      console.log( error );
      callback();
    });
  };
  AppraiserService.prototype.getValue = function( amount, symbol ) {
    if( symbol == 'TMSC' )
      return 0;
    else if( symbol == 'BTC' )
    {
      if( this.conversions.BTC )
        return this.conversions.BTC * amount;
      else
        return 'BTC Value Unavailable';
    }
    else
    {
      if( this.conversions.MSC )
      {
        return this.getValue( this.conversions.MSC * amount, 'BTC' );
      }
      else
        return 'MSC Value Unavailable';
    }
  };

  return new AppraiserService();
}]);

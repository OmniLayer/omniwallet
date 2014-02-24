//global services go here

angular.module( 'omniwallet' ).factory('userService', ['$rootScope', function ($rootScope) {
  // Rewire to use localstorage 
  var service = {
    data: {
      addresses: []
    },

    addAddress: function( address, privKey ) {
      for( var i in service.data.addresses )
      {
        if( service.data.addresses[i].address == address )
        {
          service.data.addresses[i].privkey = privKey;
          service.saveSession();
          return;
        }
      }
      service.data.addresses.push( {
        "address": address,
        "privkey": privKey
      });
      service.saveSession();
    },

    removeAddress: function( address ) {
      for( var i=0; i<service.data.addresses.length; i++ )
        if( service.data.addresses[i].address == address )
        {
          service.data.addresses.splice( i, 1 );
          service.saveSession();
          return;
        }
    },

    saveSession: function () {
      localStorage["OmniWallet"] = angular.toJson(service.data);
    },
    restoreSession: function() {
      if( localStorage[ "OmniWallet" ])
        service.data = angular.fromJson(localStorage["OmniWallet"]);
    }
  };

  // $rootScope.$watch('userService.data', function(newVal, oldVal) {
  //   console.log("watched");
  //   $rootScope.$broadcast('savestate');
  // }, true);
  $rootScope.$on("savestate", service.saveSession);
  $rootScope.$on("restorestate", service.restoreSession);

  service.restoreSession();

  return service;
}]);

angular.module( 'omniwallet' ).factory( 'appraiser', ['$rootScope', function ($rootScope) {

  // Rewire to use localstorage 
  function AppraiserService() {
    this.conversions = {};
  };
  AppraiserService.prototype.getValue = function( amount, symbol ) {
    if( symbol == 'TMSC' )
      return 0;
    else if( symbol = 'BTC' )
    {
      if( this.conversions.BTC )
        return this.conversions.BTC * amount;
      else
        return 'BTC Value Unavailable';
    }
    else
    {
      if( this.conversions.MSC )
        return this.getValue( this.conversions.MSC * amount, 'BTC' );
      else
        return 'MSC Value Unavailable';
    }
  };

  return new AppraiserService();
}]);
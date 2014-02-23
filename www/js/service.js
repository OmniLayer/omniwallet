//global services go here

angular.module( 'omniwallet' ).factory('userService', ['$rootScope', function ($rootScope) {
  // Rewire to use localstorage 
  var service = {
    data: {
      addresses: [],
      uuid: '',
      loggedIn: false
    },

    login: function(uuid) {
      service.data.uuid = uuid;
      service.data.loggedIn = true;
      service.saveSession();
    },

    logout: function() {
      //Pain point as this grows
      service.data.uuid = '',
      service.data.loggedIn = false;
      service.data.addresses = [];
      localStorage.clear();
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
      service.data.loggedIn = true;
      service.saveSession();
    },

    getAddress: function(address) {
      for(var i in service.data.addresses) {
        if(service.data.addresses[i].address == address) {
          return service.data.addresses[i];
        }
      }
    },

    removeAddress: function( address ) {
      for( var i=0; i<service.data.addresses.length; i++ )
        if( service.data.addresses[i].address == address )
        {
          service.data.addresses.splice( i, 1 );
          service.saveSession();
          return;
        }

      if(service.data.addresses.length == 0) {
        //Consider this a log out as well?
        service.data.loggedIn = false;
        service.saveSession();
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

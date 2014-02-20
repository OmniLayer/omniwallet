//global services go here

angular.module( 'omniwallet' ).factory('userService', ['$rootScope', function ($rootScope) {
  // Rewire to use localstorage 
  var service = {
    data: {
      loggedIn: false,
      username: '',
      "uuid":"39cd5e05-aa4a-400c-c4c4-9fe70332bd01",
      "addresses":[ 
        { address: '1EXoDusjGwvnjZUyKkxZ4UHEf77z6A5S4P', privkey: '' },
        { address: '1MaStErt4XsYHPwfrN9TpgdURLhHTdMenH', privkey: '' },
        { address: '1GaNupdUBzfVF2B3JUAY1rZwHoXJgjyzXj', privkey: '' }
      ]
    },

    saveSession: function () {
      localStorage["Wallet"] = angular.toJson(service.data)
    },
    restoreSession: function() {
      service.data = angular.fromJson(localStorage["Wallet"]);
    }
  };

  // $rootScope.$watch('userService.data', function(newVal, oldVal) {
  //   console.log("watched");
  //   $rootScope.$broadcast('savestate');
  // }, true);
  $rootScope.$on("savestate", service.saveSession);
  $rootScope.$on("restorestate", service.restoreSession);

  return service;
}]);

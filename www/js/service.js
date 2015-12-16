//global services go here

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




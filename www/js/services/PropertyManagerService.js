angular.module('omniServices')
  .service('PropertyManager',['$http','$cacheFactory',function PropertyManagerService($http,$cacheFactory){
    var self = this;
    var $propertyCache = $cacheFactory("propertyCache")

    self.getProperty =function(propertyId){
      return $http.get('/v1/properties/getdata/' + propertyId, {cache: $propertyCache} )
    }
    
    self.getActiveCrowdsales = function(ecosystem) {
      var url = '/v1/properties/listactivecrowdsales';
      var data = {
        ecosystem: ecosystem
      };
      var promise = $http.post(url, data);
      return promise;
    }

    self.list=function() {
      var url = '/v1/properties/list';

      var promise = $http.get(url);
      return promise;
    }

    self.listByOwner=function(addresses) {
      var url = '/v1/properties/listbyowner';
      var data = {
        issuer_addresses: addresses
      };
      var promise = $http.post(url, data);
      return promise;
    }

    self.listByEcosystem=function(ecosystem) {
      var url = '/v1/properties/listbyecosystem';
      var data = {
        ecosystem: ecosystem
      };
      var promise = $http.post(url, data);
      return promise;
    }

    self.getHistory = function(propertyId,from,count){
      var url = '/v1/properties/gethistory/'+propertyId;
      var data = {
        start: from,
        count: count
      };
      var promise = $http.post(url, data);
      return promise;
    }
    
    self.loadCategories=function(ecosystem) {
      var url = '/v1/properties/categories';
      var data = {
        ecosystem: ecosystem
      };
      var promise = $http.post(url, data);
      return promise;
    };
  
    self.loadSubcategories=function(ecosystem,category) {
      var url = '/v1/properties/subcategories';
      var data = {
        ecosystem: ecosystem,
        category: category
      };
      var promise = $http.post(url, data);
      return promise;
    }
}]);
angular.module('omniServices')
  .service('PropertyManager',['$http',function PropertyManagerService($http){
    var self = this;
    
    self.getProperty =function(propertyId){
      return $http.get('/v1/properties/getdata/' + propertyId )
    }
    
    self.listProperties=function(ecosystem) {
      var url = '/v1/properties/list';
      var data = {
        ecosystem: ecosystem
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
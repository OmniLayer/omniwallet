angular.module("omniFactories")
	.factory("AddressManager", ["$http", function AddressManagerFactory($http){
		var AddressManager = {
			validateAddress:function(addr) {
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
		}

		return AddressManager;
	}]);
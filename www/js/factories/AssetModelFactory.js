angular.module("omniFactories")
	.factory("Asset", [function AssetsModelFactory(){
		var Asset = function(symbol,divisible,tradable,address){
			var self = this;

			self.initialize = function(){
                self.symbol = symbol;
                self.divisible = divisible;
                self.tradableAddresses = tradable ? [address] : [];
                self.watchAddresses = !tradable ? [address] : [];
                self.addresses = function(){ 
                	return self.tradableAddresses.concat(self.watchAddresses); 
                };
                self.tradable = tradable;

				if(symbol.substring(0, 2) == "SP"){
                	self.id = symbol.substring(2);
	                $http.get('/v1/property/' + id + '.json').then(function(result) {
	                  var property = result.data[0];
	                  self.name = property.propertyName;
	                  self.property_type = property.formatted_property_type;
	                });
                } else {
                	self.id = symbol == "BTC" ? 0 : symbol == "MSC" ? 1 : symbol == "TMSC" ? 2 : null;
                	self.name = symbol;
                }
			}

			self.initialize();
		}

		return Asset;
	}])
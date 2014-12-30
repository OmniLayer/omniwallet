angular.module("omniFactories")
	.factory("Asset", ["PropertyManager","$rootScope","$injector",function AssetsModelFactory(PropertyManager,$rootScope,$injector){
		var Asset = function(symbol, balance,tradable,address){
			var self = this;
			var appraiser = $injector.get('appraiser');
			self.initialize = function(){
                self.symbol = symbol;
                self.balance = balance;
                self.tradableAddresses = tradable ? [address] : [];
                self.watchAddresses = !tradable ? [address] : [];
                self.addresses = function(){ 
                	return self.tradableAddresses.concat(self.watchAddresses); 
                };
                self.tradable = tradable;

				if(symbol.substring(0, 2) == "SP"){
                	self.id = symbol.substring(2);
                } else {
                	self.id = symbol == "BTC" ? 0 : symbol == "MSC" ? 1 : symbol == "TMSC" ? 2 : null;
                	self.divisible=true;
                }

                PropertyManager.getProperty(self.id).then(function(result) {
                  var property = result.data;
                  angular.extend(self,property);
                  self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                });

                $rootScope.$on("BALANCE_CHANGED",function(evt,changed,values){
                	var index = changed.indexOf(self.symbol);
                	if(index>-1){
                		self.balance=values[index];
                		self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                	}
                })

			}

			self.initialize();
		}

		return Asset;
	}])
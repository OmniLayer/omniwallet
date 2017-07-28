angular.module("omniFactories")
	.factory("Asset", ["PropertyManager","$rootScope","$injector", "WHOLE_UNIT","SATOSHI_UNIT", function AssetsModelFactory(PropertyManager,$rootScope,$injector,WHOLE_UNIT,SATOSHI_UNIT ){
		var Asset = function(symbol, balance,tradable,address){
			var self = this;
			var appraiser = $injector.get('appraiser');
			self.initialize = function(){
                self.symbol = symbol;
                self.balance = new Big(balance);
                self.pendingneg = new Big(0);
                self.pendingpos = new Big(0);
                self.tradableAddresses = tradable ? [address] : [];
                self.watchAddresses = !tradable ? [address] : [];
                self.price = 0;

                self.addresses = function(){ 
                	return self.tradableAddresses.concat(self.watchAddresses); 
                };
                self.tradable = tradable;

				        if(symbol.substring(0, 2) == "SP"){
                	self.id = symbol.substring(2);
                } else {
                	self.id = symbol == "BTC" ? 0 : symbol == "OMNI" ? 1 : symbol == "T-OMNI" ? 2 : null;
                	self.divisible=true;
                }

                PropertyManager.getProperty(self.id).then(function(result) {
                  var property = result.data;
                  angular.extend(self,property);
                  if (self.name == "BTC") self.name = "Bitcoin";
                  self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                  if(self.divisible){
                      self.displayBalance = self.balance.times(WHOLE_UNIT).toFixed() 
                      self.displayPendingPos = self.pendingpos.times(WHOLE_UNIT).toFixed()
                      self.displayPendingNeg = self.pendingneg.times(WHOLE_UNIT).toFixed()
                    } else {
                      self.displayBalance = self.balance.valueOf();
                      self.displayPendingPos = self.pendingpos.valueOf();
                      self.displayPendingNeg = self.pendingneg.valueOf();
                    }
                  $rootScope.$broadcast("asset:loaded", {data:self})
                });

                $rootScope.$on("balance:"+self.symbol,function(evt, delta, dneg, dpos){

            		    self.balance = self.balance.plus(delta);
                    self.pendingneg = self.pendingneg.plus(dneg);
                    self.pendingpos = self.pendingpos.plus(dpos);
                    if(self.divisible){
                      self.displayBalance = self.balance.times(WHOLE_UNIT).toFixed() 
                      self.displayPendingPos = self.pendingpos.times(WHOLE_UNIT).toFixed()
                      self.displayPendingNeg = self.pendingneg.times(WHOLE_UNIT).toFixed()
                    } else {
                      self.displayBalance = self.balance.valueOf();
                      self.displayPendingPos = self.pendingpos.valueOf();
                      self.displayPendingNeg = self.pendingneg.valueOf();
                    }
            		    self.value = appraiser.getValue(self.balance, self.symbol, self.divisible);
                });

			}

			self.initialize();
		}

		return Asset;
	}])
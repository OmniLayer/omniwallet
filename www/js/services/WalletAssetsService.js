angular.module("omniServices")
	.service("WalletAssets",["$rootScope", "$injector", "userService", "AddressManager", "SATOSHI_UNIT", "MIN_MINER_FEE", "MSC_PROTOCOL_COST",
		function WalletAssetsService($rootScope, $injector, userService, AddressManager, SATOSHI_UNIT, MIN_MINER_FEE, MSC_PROTOCOL_COST){
			var self = this;
			var addrListBal = [];

			self.initialize = function(){

				self.currencyList = userService.getCurrencies().filter(function(currency){
				       return currency.tradable;
				}); // [{symbol: 'BTC', addresses:[], name: 'BTC'}, {symbol: 'MSC', addresses:[], name: 'MSC'}, {symbol: 'TMSC', addresses:[], name: 'TMSC'}]
				  
				  
			    self.selectedCoin = self.currencyList[0];
			    self.currencyList.forEach(function(e, i) {
			      if (e.symbol == "MSC")
			        self.selectedCoin = e;
			    });
					  
				self.addressList = self.selectedCoin ? userService.getAddressesWithPrivkey(self.selectedCoin.tradableAddresses) : [];
					  
				self.selectedAddress = self.addressList[0] || null;

				self.minerFees = +MIN_MINER_FEE.valueOf(); //set default miner fees
				
				

				// [ Retrieve Balances ]
				self.currencyUnit = 'stom'; // satoshi to millibitt
				self.amountUnit = 'mtow';
				self.balanceData = [0];
				// fill the addrListBal with all the addresses on the wallet for which we've got private keys.
				userService.getAddressesWithPrivkey().forEach(function(e, i) {
				    var balances = [
				      {
				        symbol: 'MSC',
				        value: '0'
				      },
				      {
				        symbol: 'TMSC',
				        value: '0'
				      },
				      {
				        symbol: 'BTC',
				        value: '0'
				      }];
				    addrListBal[i] = {
				      address: e,
				      balance: balances
				    };
				    var promise = AddressManager.getAddressData(e);
				    promise.then(function(successData) {
				      var successData = successData.data;
				      addrListBal[i].balance =  successData.balance;
				      self.setBalance();
				    }, function(errorData) {
				      alert("We have encountered a problem accessing the server ... Please try again in a few minutes");
				      //console.log('Error, no balance data found for ' + e + ' setting defaults...');
				    });
				});
					  
				
				self.calculateTotal(self.minerFees);
				self.setBitcoinValue(self.getBitcoinValue());  				
			}

			self.setBalance = function() {
			    var coin = self.selectedCoin ? self.selectedCoin.symbol : null;
			    var address = self.selectedAddress;
			    self.balanceData = [0,0];
			    if (address || coin) {
			      for (var i = 0; i < addrListBal.length; i++) {
			        if (addrListBal[i].address == address) {
			          for (var k = 0; k < addrListBal[i].balance.length; k++) {
			            if (addrListBal[i].balance[k].symbol == coin) {
			              var divisible = addrListBal[i].balance[k].divisible;
			              self.balanceData[0] = divisible ? new Big(addrListBal[i].balance[k].value).times(WHOLE_UNIT).valueOf() : addrListBal[i].balance[k].value;
			            }
			            if (addrListBal[i].balance[k].symbol == 'BTC') {
			              self.balanceData[1] = new Big(addrListBal[i].balance[k].value).times(WHOLE_UNIT).valueOf();
			            }
			          }
			        }
			      }
			    }
			};

			self.convertSatoshiToDisplayedValue = function(satoshi, forceConvertToWhole ) {
			    if(self.selectedCoin.divisible || forceConvertToWhole )
			        return new Big(satoshi).times(WHOLE_UNIT).toFixed(8);
			    else
			        return satoshi;
			};


			self.getDisplayedAbbreviation = function () {
			    if(self.selectedCoin.divisible) {
			      self.sendPlaceholderValue = '1.00000000';
			      self.sendPlaceholderStep = self.sendPlaceholderMin = '0.00000001';
			    } else {
			      self.sendPlaceholderValue = self.sendPlaceholderStep = self.sendPlaceholderMin = '1';
			    }
			    if (self.selectedCoin.symbol.indexOf('SP') == 0) {
			      for (var i in self.currencyList) {
			        if (self.currencyList[i].symbol == self.selectedCoin.symbol)
			          return self.currencyList[i].name + ' #' + self.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
			      }
			      return 'Smart Property #' + self.selectedCoin.symbol.match(/SP([0-9]+)/)[1];
			    }
			    else
			      return self.selectedCoin.symbol;
			};
			  
			self.getBitcoinValue = function(){
			    var appraiser = $injector.get('appraiser');
			    return appraiser.getValue(100000000,"BTC");
			}
			self.setBitcoinValue = function(value){
			    self.bitcoinValue = value;
			} 
			self.convertDisplayedValue = function (value) {
			      if (value instanceof Array) {
			        value.forEach(function(e, i, a) {
			            a[i] = new Big(e).times(SATOSHI_UNIT).valueOf();
			        });
			        return value;
			      } 
			      else
			          return new Big(value).times(SATOSHI_UNIT).valueOf();
			};

			self.calculateTotal=function(minerFees) {
			    self.mProtocolCost = MSC_PROTOCOL_COST
			    if (self.selectedCoin && self.selectedCoin.symbol == 'BTC')
			    	self.mProtocolCost = 0.0;
			    self.totalCost = (+new Big(minerFees).plus(self.mProtocolCost).valueOf()).toFixed(8);
			}

			self.initialize();

			var updateData = function(){
			    self.addressList = self.selectedCoin ? userService.getAddressesWithPrivkey(self.selectedCoin.tradableAddresses) : [];
			    self.selectedAddress = self.addressList[0] || null;
			    self.setBalance();
			    self.minerFees = +MIN_MINER_FEE.valueOf(); // reset miner fees
			    self.calculateTotal(self.minerFees);
			}
			
			$rootScope.$watch(function(){return self.selectedCoin;}, function() {
			    updateData()
			});

			$rootScope.$watch(function(){return self.offlineSupport;}, function() {
			    updateData()
			});
			$rootScope.$watch(function(){return self.selectedAddress;}, function() {
				self.setBalance();
			    var pubkey = userService.getAddress(self.selectedAddress).pubkey;
			    self.offline = pubkey != undefined && pubkey != "";
			});
		}
	]);
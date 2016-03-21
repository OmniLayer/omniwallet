angular.module("omniServices")
	.service("Wallet",["Address", "Asset", "BalanceSocket","$injector","$rootScope",
		function WalletService(Address, Asset, BalanceSocket,$injector,$rootScope){
			var self = this;

			var appraiser = null;
			self.loaded = false;
			self.initialize =function(wallet){
				if(!BalanceSocket.connected)
					BalanceSocket.connect();
				appraiser = $injector.get('appraiser');

	            self.addresses = [];
	            self.assets = [];
	            self.loader = {
	            	totalAddresses: wallet.addresses.length || 1,
	            	totalAssets:1,
	            	addresses:0,
	            	assets:0,
	            	loadedAddresses:false,
	            	loadedAssets:false
	            }
	            wallet.addresses.forEach(function(raw){
	                self._addAddress(raw);
	            });

	            appraiser.start();

				$rootScope.$on("address:loaded", function(address){
					self.loader.addresses +=1;
						check_load()
				});

				$rootScope.$on("asset:loaded", function(asset){
					self.loader.assets +=1;
						check_load()
				});

				function check_load(){
					if(self.loader.addresses==self.loader.totalAddresses)
						self.loader.loadedAddresses = true;

					if(self.loader.assets==self.loader.totalAssets){
						self.loader.loadedAssets = true;
						self.assets = self.assets.sort(function(itemA, itemB){
							var nameA = itemA.name;
							var nameB = itemB.name;

							var order = 0;
							if(nameA == "BTC")
								order = -1;
							else if(nameB == "BTC")
								order = 1;
							else
								order = nameA < nameB ? -1 : nameA > nameB ? 1 : 0;

							return order;

						});
					}

					if(self.loader.loadedAddresses && self.loader.loadedAssets)
						self.loaded = true;
				}
	        };


	        self.destroy = function(){
	        	self.addresses = [];
	            self.assets = [];
	        	BalanceSocket.disconnect();
	        	
	        }

	        self._addAddress = function(raw){
	        	var address = new Address(raw.address,raw.privkey,raw.pubkey);

                BalanceSocket.on("address:"+address.hash, function(data){
                    var update = false;                    
                    data.balance.forEach(function(balanceItem) {
                        var tradable = ((address.privkey && address.privkey.length == 58) || address.pubkey) && balanceItem.value > 0;
                        var asset = null;
                        for (var j = 0; j < self.assets.length; j++) {
                          var currencyItem = self.assets[j];
                          if (currencyItem.symbol == balanceItem.symbol) {
                            asset = currencyItem;
                            if (asset.addresses().indexOf(address) == -1){
                             tradable ? asset.tradableAddresses.push(address) : asset.watchAddresses.push(address) ;
                             asset.tradable = asset.tradable || tradable;
                            }
                            break;
                          }
                        }
                        if (asset === null) {
                        	if(balanceItem.symbol!="BTC")
                            	self.loader.totalAssets += 1;
                            
                            asset = new Asset(balanceItem.symbol,balanceItem.value, tradable, address)

                            self.assets.push(asset);
                            update=true;
                        }
                    });

					if(update){
						appraiser.updateValues();
					}
						
                });

                self.addresses.push(address)
	        }

	        self._updateAddress = function(address,privKey,pubKey){
	        	for (var i in self.addresses) {
		            if (self.addresses[i].hash == address) {
		                if(privKey){
		                	self.addresses[i].privkey = privKey;
		                	self.addresses[i].pubkey = undefined;
		                }
		                  
		                if(pubKey)
		                  self.addresses[i].pubkey = pubKey;
		            }
	            }
	        }

	        self._removeAddress = function(addressHash){
	        	for (var i = 0; i < self.addresses.length; i++)
	              if (self.addresses[i].hash == addressHash) 
	                var address = self.addresses.splice(i, 1)[0];

	            address.balance.forEach(function(balance){
	            	var asset = self.getAsset(balance.id);
	            	if (asset.tradableAddresses.indexOf(address) > -1)
	            		asset.tradableAddresses.splice(asset.tradableAddresses.indexOf(address), 1)
	            	else
	            		asset.watchAddresses.splice(asset.watchAddresses.indexOf(address), 1)
	            })
	        }

	        self.getAsset = function(assetId){
	        	return self.assets.filter(function(asset){
	        		return asset.id == assetId;
	        	})[0];
	        }

	        self.getAddress = function(addressHash){
	        	return self.addresses.filter(function(address){
	        		return address.hash == addressHash;
	        	})[0];	
	        }

	        self.transactions = function(showtesteco){
	        	return self.addresses.map(function(address){
	        		return address.transactions;
	        	}).reduce(function(previous,current){
	        		return previous.concat(current);
	        	}).filter(function(tx){
			        return ((tx.currency.propertyid < 2147483648 && tx.currency.propertyid != 2) || showtesteco === 'true'); 
			    });
	        }

	        self.tradableAddresses = function(){
	        	return self.assets.map(function(asset){
	        		return asset.tradableAddresses;
	        	}).reduce(function(previous,current){
	        		var next = previous;
	        		current.forEach(function(address){
	        			if(previous.indexOf(address)==-1)
	        				next.push(address)
	        		})
	        		return next;
	        	})
	        }
			// self.initialize = function(){				  
			//     self.selectedCoin = self.currencyList[0];
			//     self.currencyList.forEach(function(e, i) {
			//       if (e.symbol == "MSC")
			//         self.selectedCoin = e;
			//     });
					  
			// 	self.addressListByCoin = self.selectedCoin ? userService.getTradableAddresses(self.selectedCoin.tradableAddresses,true) : [];
			// 	self.addressList = userService.getTradableAddresses(null,true);
			// 	self.selectedAddress = self.addressListByCoin[0] || null;


			// 	// [ Retrieve Balances ]
				
			// 	self.calculateTotal(self.minerFees);
			// 	self.setBitcoinValue(self.getBitcoinValue());  				
			// }

			// self.getBitcoinValue = function(){
			//     return appraiser.getValue(100000000,"BTC");
			// }
			// self.setBitcoinValue = function(value){
			//     self.bitcoinValue = value;
			// } 

			// self.calculateTotal=function(minerFees) {
			//     self.mProtocolCost = MSC_PROTOCOL_COST
			//     if (self.selectedCoin && self.selectedCoin.symbol == 'BTC')
			//     	self.mProtocolCost = 0.0;
			//     self.totalCost = (+new Big(minerFees).plus(self.mProtocolCost).valueOf()).toFixed(8);
			// }

			// self.initialize();
			
			// $rootScope.$watch(function(){return self.selectedCoin;}, function() {
			//     self.addressListByCoin = self.selectedCoin ? userService.getTradableAddresses(self.selectedCoin.tradableAddresses) : [];
			//     self.selectedAddress = self.addressListByCoin[0] || null;
			//     self.setBalance();
			//     self.minerFees = +MIN_MINER_FEE.valueOf(); // reset miner fees
			//     self.calculateTotal(self.minerFees);
			// });

			// $rootScope.$watch(function(){return self.selectedAddress;}, function() {
			// 	self.setBalance();
			//     var pubkey = userService.getAddress(self.selectedAddress).pubkey;
			//     self.offline = pubkey != undefined && pubkey != "";
			// });
		}
	]);

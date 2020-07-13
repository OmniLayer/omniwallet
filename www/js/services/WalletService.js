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
                self.settings = wallet.settings;
                self.addresses = [];
                self.assets = [];
                self.assetIDs = [];
                self.loader = {
                    totalAddresses: wallet.addresses.length || 1,
                    totalAssets:1,
                    addresses:0,
                    assets:0,
                    loadedAddresses:false,
                    loadedAssets:false
                }
                self.managed = {
                    address: null,
                    assetid: null
                }

                wallet.addresses.forEach(function(raw){
                    self._addAddress(raw);
                });

                //Make sure we stay connected
                var ensureWebsocketIsConnected = function() {
                    if(!BalanceSocket.connected) {
                        BalanceSocket.connect();
                    }
                    self.ensureWebsocketIsConnectedTimeout = setTimeout(ensureWebsocketIsConnected,15000);
                }
                ensureWebsocketIsConnected();

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
                            var idA = itemA.id;
                            var idB = itemB.id;

                            var order = 0;
                            //Prioritize BTC first in list
                            if(idA == 0)
                                order = -1;
                            else if(idB == 0)
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

            self.getSetting = function(setting){
                return Account.getSetting(setting);
            }

            self.destroy = function(){
                self.addresses = [];
                self.assets = [];
                BalanceSocket.disconnect();
            }

            self._addAddress = function(raw){
                var address = new Address(raw.address,raw.privkey,raw.pubkey);

                BalanceSocket.on("address:book", function(data){
                    if (typeof data[address.hash]!="undefined") {
                        processBalanceSocket(data[address.hash].balance);
                    }
                });

                BalanceSocket.on("address:"+address.hash, function(data){
                    if (data != null) {
                      processBalanceSocket(data.balance);
                    }
                });

                var processBalanceSocket = function(serverBalance) {
                    var update = false;
                    serverBalance.forEach(function(balanceItem) {
                        var asset = null;
			var pkey = address.keyCheck;
                        var tradable = pkey && (balanceItem.value > 0 || balanceItem.id == 0);

                        if (typeof self.assets === "undefined") {
                          assetLength=0;
                        } else {
                          assetLength = self.assets.length;
                        }

                        for (var j = 0; j < assetLength; j++) {
                            var currencyItem = self.assets[j];
                            if (currencyItem.symbol == balanceItem.symbol) {
                                asset = currencyItem;
                                if (asset.addresses().indexOf(address) == -1) {
                                    tradable ? asset.tradableAddresses.push(address) : asset.watchAddresses.push(address) ;
                                    asset.tradable = asset.tradable || tradable;
                                }
                                break;
                            }
                        }
                        if (asset === null) {
                            if(balanceItem.symbol!="BTC"){
                                self.loader.totalAssets += 1;
                            }
                            asset = self.addAsset(balanceItem.symbol,balanceItem.value, tradable, address, balanceItem.propertyid);
                            update=true;
                        }
                        if(address.assets.indexOf(asset) == -1){
                            address.assets.push(asset);
                        }
                    });
                    if(update){
                        appraiser.updateValues();
                    }
                };

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

            self.getTotalValue = function(address) {
                var value=0;
                address.balance.forEach( function(asset, index, array){
                    var price=self.getAsset(asset.id).price;
                    value+=address.getDisplayBalance(asset.id) * price;
                });
                return value;
            }

            self.addAsset = function(symbol, balance, tradable, address, propertyid) {
              asset = new Asset(symbol, balance, tradable, address)
              self.assets.push(asset);
              self.assetIDs.push(propertyid);
              return asset
            }

            self.getAsset = function(assetId,filter=false){
                if (filter){
                  return self.assets.filter(function(asset){
                    return asset.id != assetId;
                  })[0];
                } else {
                  return self.assets.filter(function(asset){
                    return asset.id == assetId;
                  })[0];
                }
            }

            self.getAddress = function(addressHash){
                return self.addresses.filter(function(address){
                    return address.hash == addressHash;
                })[0];
            }

            self.getManagedAddress = function(){
                if (self.managed.address === null) {
                    return null;
                } else {
                    return self.getAddress(self.managed.address);
                }
            }

            self.getManagedAsset = function(){
                if (self.managed.assetid === null) {
                    return null;
                } else {
                    return self.getAsset(self.managed.assetid);
                }
            }

            self.getManagedType = function(){
                return self.managed.type_int;
            }

            self.setManagedAddress = function(addressHash){
                self.managed.address=addressHash;
            }

            self.setManagedAsset = function(assetID){
                self.managed.assetid=assetID;
            }

            self.setManagedType = function(type_int){
                self.managed.type_int=type_int;
            }

            self.transactions = function(showtesteco){
                return self.addresses.map(function(address){
                    return address.transactions(showtesteco);
                });
            }

            self.tradableAddresses = function(){
                return self.assets.map(function(asset){
                    return ((asset.id < 2147483648 && asset.id != 2) || self.getSetting["showtesteco"] === 'true') ? asset.tradableAddresses : [];
                }).reduce(function(previous,current){
                    var next = previous;
                    current.forEach(function(address){
                        if(previous.indexOf(address)==-1)
                            next.push(address)
                    })
                    return next;
                })
            }

            self.omniTradableAddresses = function(){
                return self.assets.map(function(asset){
                    return (((asset.id < 2147483648 && asset.id != 2) || self.getSetting["showtesteco"] === 'true')  && asset.id != 0) ? asset.tradableAddresses : [];
                }).reduce(function(previous,current){
                    var next = previous;
                    current.forEach(function(address){
                        if(previous.indexOf(address)==-1)
                            next.push(address)
                    })
                    return next;
                })
            }
        }
    ]);

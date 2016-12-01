angular.module("omniFactories")
	.factory("Orderbook",["$http","DExOrder","DExOffer","BalanceSocket","Transaction","Account","Wallet","ModalManager","MIN_MINER_FEE", "MINER_SPEED", "WHOLE_UNIT", "SATOSHI_UNIT",
		function OrderbookFactory($http, DExOrder,DExOffer,BalanceSocket,Transaction,Account,Wallet,ModalManager,MIN_MINER_FEE,MINER_SPEED,WHOLE_UNIT,SATOSHI_UNIT){
			var Orderbook = function(tradingPair){
				var self = this;

				self.initialize = function(){
					self.tradingPair=tradingPair;
					self.title = "Trade " + tradingPair.selling.name + " for " + tradingPair.desired.name;
					self.active = true;
					self.disabled = !self.active;
					self.buyOrder = {
						desired : tradingPair.selling,
						selling : tradingPair.desired,
						amounts : {
							desired: 0,
							selling: 0
						},
						price: 0,
						feeType: MINER_SPEED,
						invalid: true
					};
					self.sellOrder = {
						desired : tradingPair.desired,
						selling : tradingPair.selling,
						amounts : {
							desired: 0,
							selling: 0
						},
						price: 0,
						feeType: MINER_SPEED,
						invalid: true
					};

					self.selling = tradingPair.selling;
					self.desired = tradingPair.desired;
					self.marketData = [];
					self.chartConfig = {
			            chart: {
			                type: 'candlestickBarChart',
			                height: 450,
			                margin : {
			                    top: 20,
			                    right: 20,
			                    bottom: 66,
			                    left: 60
			                },
			                x: function(d){ return d['date']; },
			                y: function(d){ return d['close']; },
			                duration: 100,
			                
			                xAxis: {
			                    axisLabel: 'Dates',
			                    tickFormat: function(d) {
			                        return d3.time.format('%x')(new Date(d * 86400000));
			                    },
			                    showMaxMin: false
			                },

			                yAxis: {
			                    axisLabel: 'Price',
			                    tickFormat: function(d){
			                        return '$' + d3.format(',.1f')(d);
			                    },
			                    showMaxMin: false
			                },
			                zoom: {
			                    enabled: true,
			                    scaleExtent: [1, 10],
			                    useFixedDomain: false,
			                    useNiceScale: false,
			                    horizontalOff: false,
			                    verticalOff: true,
			                    unzoomEventType: 'dblclick.zoom'
			                }
			            }
			        };
				if (Account.loggedIn) {
					// TODO:  list only addresses with balance > 0
					self.addresses = Wallet.addresses.filter(function(address){
						return ((address.privkey && address.privkey.length == 58) || address.pubkey)
					});
					self.buyAddresses = self.addresses.filter(function(address){
						return address.getBalance(self.desired.propertyid).gt(0);
					});
					self.buyOrder.address = self.buyAddresses.length > 0 ? self.buyAddresses[0] : undefined;
					self.sellAddresses = self.addresses.filter(function(address){
						return address.getBalance(self.selling.propertyid).gt(0);
					});
					self.sellOrder.address = self.sellAddresses.length > 0 ? self.sellAddresses[0] : undefined;
				}
					self.askBook = [];
					self.bidBook = [];
					self.activeOffers = [];

					if(!BalanceSocket.connected)
                                                BalanceSocket.connect();

					BalanceSocket.on("orderbook", function(data){
						bigbook=data;
						updateAsks(bigbook);
						updateBids(bigbook);
					});

					//process websocket orderbook
					var updateAsks = function(bigbook){
						if (typeof bigbook=="undefined" || typeof bigbook[tradingPair.desired.propertyid]=="undefined" || typeof bigbook[tradingPair.desired.propertyid][tradingPair.selling.propertyid]=="undefined") {
							return // handle errors
						}
						data=bigbook[tradingPair.desired.propertyid][tradingPair.selling.propertyid];
						if (data.status != 200)
							return // handle errors
						var orderbook = [];
						self.parseOrderbook(data.orderbook, orderbook,tradingPair.desired,tradingPair.selling,data.cancels);
						self.askBook = orderbook;
						self.askBook.sort(function(a, b) {
							var priceA = a.price;
							var priceB = b.price;
							return priceA.gt(priceB) ? 1 : priceA.lt(priceB) ? -1 : 0;
						});
					}

					// Initial load of orders for property selling asks
					var updateAsksInitial = function(){
						$http.get("/v1/omnidex/"+tradingPair.desired.propertyid+"/"+tradingPair.selling.propertyid)
						.then(function(response){
							if(response.status != 200 || response.data.status !=200)
								return // handle errors

							var orderbook = [];
							self.parseOrderbook(response.data.orderbook, orderbook,tradingPair.desired,tradingPair.selling,response.data.cancels);
							self.askBook = orderbook;
							self.askBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return priceA.gt(priceB) ? 1 : priceA.lt(priceB) ? -1 : 0;
					        });

							//self.updateAsksTimeout = setTimeout(updateAsks,3000);
						})
					}
					updateAsksInitial();

                                        //process websocket orderbook
                                        var updateBids = function(bigbook){
						if (typeof bigbook=="undefined" || typeof bigbook[tradingPair.selling.propertyid]=="undefined" || typeof bigbook[tradingPair.selling.propertyid][tradingPair.desired.propertyid]=="undefined"){
							return // handle errors
						}
                                                data=bigbook[tradingPair.selling.propertyid][tradingPair.desired.propertyid];
                                                if (data.status != 200)
                                                        return // handle errors
                                                var orderbook = [];
                                                self.parseOrderbook(data.orderbook, orderbook,tradingPair.selling,tradingPair.desired,data.cancels);
                                                self.bidBook = orderbook;
                                                self.bidBook.sort(function(a, b) {
                                                        var priceA = a.price;
                                                        var priceB = b.price;
                                                        return priceA.lt(priceB) ? 1 : priceA.gt(priceB) ? -1 : 0;
                                                });
                                        }

					var updateBidsInitial = function(){
						$http.get("/v1/omnidex/"+tradingPair.selling.propertyid+"/"+tradingPair.desired.propertyid)
						.then(function(response){
							if(response.status != 200 || response.data.status != 200)
								return // handle errors
							
							var orderbook = [];
							self.parseOrderbook(response.data.orderbook, orderbook,tradingPair.selling,tradingPair.desired,response.data.cancels);
							self.bidBook = orderbook;
							self.bidBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return priceA.lt(priceB) ? 1 : priceA.gt(priceB) ? -1 : 0;
					        });

							//self.updateBidsTimeout = setTimeout(updateBids, 3000);
						})
					}
					updateBidsInitial();


					$http.get("/v1/omnidex/ohlcv/"+tradingPair.desired.propertyid+"/"+tradingPair.selling.propertyid)
						.then(function(response){
							if(response.status != 200 || response.data.status !=200)
								return // handle errors

							self.marketData=response.data.orderbook;
							self.chartData = [
										{
											values: self.marketData
										}
									]
						})
				};

				self.parseOrderbook =function(orderbook,side,selling,desired,cancels){
					orderbook.forEach(function(offerData){
						// check if there's a pending cancel for this offer
						var iscanceled = cancels.find(function(cancelOffer){
							return cancelOffer.desired_amount == offerData.desired_amount && cancelOffer.total_amount == offerData.total_amount;
						})
						if(!iscanceled){
							var order = null;
							var offer = new DExOffer(offerData,selling,desired,selling == self.tradingPair.selling ? "bid":"ask");
							side.forEach(function(orderData){
								if(orderData.price.eq(offer.price)){
									order = orderData;
									order.addOffer(offer)
								}
							})
							if (Account.loggedIn) {
								owner = Wallet.tradableAddresses().find(function(elem){
									return elem.hash == offerData.seller
								})
							} else {
								owner=false;
							}
							if(owner){
								offer.ownerAddress = owner;
								offer.side = selling == self.tradingPair.selling ? "bid":"ask";
								if(!self.activeOffers.find(function(element){return element.txhash == offer.txhash;})){
									self.activeOffers.push(offer);
								}
								var confirmed = self.activeOffers.find(function(element){
									return offer.status == 'active' && element.status == 'pending' && element.txhash == offer.txhash;
								});

								if(confirmed){
									self.activeOffers.splice(self.activeOffers.indexOf(confirmed),1);
								}
							}
							if(order == null){
								order = new DExOrder(offer);
								side.push(order);
							}
						} else {
							var cancelled = self.activeOffers.find(function(element){
								return element.status == 'active' && element.rawdata.desired_amount == iscanceled.desired_amount && element.rawdata.total_amount == iscanceled.total_amount;
							});

							if(cancelled){
								self.activeOffers.splice(self.activeOffers.indexOf(cancelled),1);
							}
						}
					});
				}
				self.formatOffer = function(offer) {
					return new DExOrder(offer);
				}

				self.askCumulative = function(order){
					index = self.askBook.indexOf(order);
					cumulative = new Big(0);
					for (i = 0; i <= index; i++){
						cumulative = cumulative.plus(self.askBook[i].remainingforsale)
					}
					return cumulative;
				}
				self.bidCumulative = function(order){
					index = self.bidBook.indexOf(order);
					cumulative = new Big(0);
					for (i = 0; i <= index; i++){
						cumulative = cumulative.plus(self.bidBook[i].totaldesired)
					}
					return cumulative;
				}

				self.setBuyAddress = function(address){
					self.buyOrder.address = address;
                                        if (typeof address != "undefined") {
					  address.estimateFee().then(function(result){
						self.buyOrder.feeData=result;
						if(self.buyOrder.feeType != 'custom'){
							self.buyOrder.fee = new Big(result.class_c[self.buyOrder.feeType]);
						}
					  });
					};
					self.updateOrderValidity(self.buyOrder,"bid");
				};

				self.setSellAddress = function(address){
					self.sellOrder.address = address;
					if (typeof address != "undefined") {
					  address.estimateFee().then(function(result){
						self.sellOrder.feeData=result;
						if(self.sellOrder.feeType != 'custom'){
							self.sellOrder.fee = new Big(result.class_c[self.sellOrder.feeType]);
						}
					  });
					};
					self.updateOrderValidity(self.sellOrder,"ask");
				};

				self.updateOrderValidity = function(offer,side) {
					if(side == "bid") {
						balance=parseFloat(self.getBalance(offer.address, self.tradingPair.desired.propertyid));
					} else {
						balance=parseFloat(self.getBalance(offer.address, self.tradingPair.selling.propertyid));
					}
					if (balance < offer.amounts.selling | offer.amounts.selling == 0 | offer.amounts.selling == null) {
						offer.invalid=true;
					} else {
						offer.invalid=false;
					}
					if ( !offer.selling.divisible && offer.amounts.selling < 1) {
						offer.invalid=true;
					}
					if ( !offer.desired.divisible && offer.amounts.desired < 1) {
						offer.invalid=true;
					}
				}

				self.updateAmount = function(offer, side) {
					if(side == "bid") {
						if (!offer.desired.divisible) {
							offer.amounts.desired=parseFloat(offer.amounts.desired.toFixed(0));
						}
						offer.amounts.selling = floatMath(offer.amounts.desired,offer.price,1,1) ||0;
					} else {
						if (!offer.selling.divisible) {
							offer.amounts.selling=parseFloat(offer.amounts.selling.toFixed(0));
						}
						offer.amounts.desired = floatMath(offer.amounts.selling,offer.price,1,0) ||0;
					}
					self.updateOrderValidity(offer,side);
				}
				self.updateTotal = function(offer, side) {
					if(side == "bid") {
						if (!offer.selling.divisible) {
							offer.amounts.selling=parseFloat(offer.amounts.selling.toFixed(0));
						}
						offer.amounts.desired = floatMath(offer.amounts.selling,offer.price,0,1) ||0;
					} else {
						if (!offer.desired.divisible) {
							offer.amounts.desired=parseFloat(offer.amounts.desired.toFixed(0));
						}
						offer.amounts.selling = floatMath(offer.amounts.desired,offer.price,0,0) ||0;
					}
					self.updateOrderValidity(offer,side);
				}

				var floatMath = function(a, b, op, md) {
					ret=0;

					//convert to whole numbers first
					wa=parseInt(a*SATOSHI_UNIT);
					wb=parseInt(b*SATOSHI_UNIT);

					//op=0 divide,  op=1 multiply
					//do initial math operation
					if (op==0){
						dc=wa/wb;	
					} else if (op==1){
						//(this is now 2x SATOSHI_UNIT large) so convert back to decimal
						dc=wa*wb*WHOLE_UNIT*WHOLE_UNIT;
					}
					//handle rounding and math.ceiling/floor funcitons
					//md=0 math.floor,   md=1 math.ceil
					if (md==0){
						ret=parseFloat(new Big(Math.floor(dc/WHOLE_UNIT)*(WHOLE_UNIT)).toFixed(8)) ||0;
					} else if (md==1) {
						ret=parseFloat(new Big(Math.ceil(dc/WHOLE_UNIT)*(WHOLE_UNIT)).toFixed(8)) ||0;
					} else {
						ret=parseFloat(new Big(dc).toFixed(8)) ||0;
					}
					
					return ret;
				}



				self.submitOffer = function(offer){
					// TODO: Validations
					var fee = offer.fee;
                                        //Account.settings.minerFee || MIN_MINER_FEE;
					var dexOffer = new Transaction(25,offer.address,fee,{
							transaction_version:0,
							propertyidforsale:offer.selling.propertyid,
							amountforsale: new Big(offer.amounts.selling).valueOf(),
							propertiddesired:offer.desired.propertyid,
							amountdesired: new Big(offer.amounts.desired).valueOf()
						});
					ModalManager.openConfirmationModal({
						dataTemplate: '/views/modals/partials/dex_offer.html',
						scope: {
							title:"Confirm OmniDex Transaction",
							address:offer.address,
							saleCurrency:offer.selling.propertyid,
							saleName:offer.selling.name,
							saleAmount:offer.amounts.selling,
							desiredCurrency:offer.desired.propertyid,
							desiredName:offer.desired.name,
							desiredAmount:offer.amounts.desired,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction",
							invert: true,
							successMessage: "Your order was placed successfully"
						},
						transaction:dexOffer
					});
				};

				self.getBalance = function(address, assetId){
					return address && address.getBalance(assetId).valueOf();
				}

				self.initialize();
			}

			return Orderbook;
		}]);

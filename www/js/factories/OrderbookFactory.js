angular.module("omniFactories")
	.factory("Orderbook",["$http","DExOrder","DExOffer","Transaction","Account","Wallet","ModalManager","MIN_MINER_FEE", "WHOLE_UNIT", "SATOSHI_UNIT", 
		function OrderbookFactory($http, DExOrder,DExOffer,Transaction,Account,Wallet,ModalManager,MIN_MINER_FEE,WHOLE_UNIT,SATOSHI_UNIT){
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
						price: 0
					};
					self.sellOrder = {
						desired : tradingPair.desired,
						selling : tradingPair.selling,
						amounts : {
							desired: 0,
							selling: 0
						},
						price: 0
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
			                    axisLabel: 'Stock Price',
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

					self.askBook = [];
					self.bidBook = [];
					self.activeOffers = [];

					// I get the orders for property selling asks
					var updateAsks = function(){
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

							self.updateAsksTimeout = setTimeout(updateAsks,3000);
						})
					}
					updateAsks();
					
					var updateBids = function(){
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

							self.updateBidsTimeout = setTimeout(updateBids, 3000);
						})
					}
					updateBids();


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
							let owner = Wallet.tradableAddresses().find(function(elem){
								return elem.hash == offerData.seller
							})
							if(owner){
								offer.ownerAddress = owner;
								offer.side = selling == self.tradingPair.selling ? "bid":"ask";
								if(!self.activeOffers.find(function(element){return element.time == offer.time;})){
									self.activeOffers.push(offer);
								}
								var confirmed = self.activeOffers.find(function(element){
									return offer.status == 'active' && element.status == 'pending' && element.desired_amount == offer.desired_amount && element.selling_amount == offer.selling_amount;
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

				

				self.askCumulative = function(order){
					let index = self.askBook.indexOf(order);
					let cumulative = new Big(0);
					for (let i = 0; i <= index; i++){
						cumulative = cumulative.plus(self.askBook[i].totaldesired)
					}
					return cumulative;
				}
				self.bidCumulative = function(order){
					let index = self.bidBook.indexOf(order);
					let cumulative = new Big(0);
					for (let i = 0; i <= index; i++){
						cumulative = cumulative.plus(self.bidBook[i].remainingforsale)
					}
					return cumulative;
				}

				self.setBuyAddress = function(address){
					self.buyOrder.address = address;
				};

				self.setSellAddress = function(address){
					self.sellOrder.address = address;
				};

				self.updateAmount = function(offer, side) {
					if(side == "bid")
						offer.amounts.selling= (offer.amounts.desired * offer.price) ||0;
					else
						offer.amounts.desired= (offer.amounts.selling * offer.price) ||0;
				}
				self.updateTotal = function(offer, side) {
					if(side == "bid")
						offer.amounts.desired= (offer.amounts.selling / offer.price) ||0;
					else
						offer.amounts.selling= (offer.amounts.desired / offer.price) ||0;
				}

				self.submitOffer = function(offer){
					// TODO: Validations
					var fee = Account.settings.minerFee || MIN_MINER_FEE;
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
							title:"Confirm DEx Transaction",
							address:offer.address,
							saleCurrency:offer.selling.propertyid,
							saleAmount:offer.amounts.selling,
							desiredCurrency:offer.desired.propertyid,
							desiredAmount:offer.amounts.desired,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction",
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
angular.module("omniFactories")
	.factory("Orderbook",["$http","DExOrder","DExOffer","Transaction","Account","Wallet","ModalManager","MIN_MINER_FEE", "WHOLE_UNIT", "SATOSHI_UNIT", 
		function OrderbookFactory($http,DExOrder,DExOffer,Transaction,Account,Wallet,ModalManager,MIN_MINER_FEE,WHOLE_UNIT,SATOSHI_UNIT){
			var Orderbook = function(tradingPair){
				var self = this;

				self.initialize = function(){
					self.tradingPair=tradingPair;
					self.title = "Trade " + tradingPair.property.propertyName + " for " + (tradingPair.pair == 1 ? "Mastercoin": "Test Mastercoin");
					self.active = true;
					self.disabled = !self.active;
					self.buyOrder = {};
					self.sellOrder = {};

					self.pair = Wallet.getAsset(tradingPair.pair);
					self.property = Wallet.getAsset(tradingPair.property.currencyId);

					// TODO:  list only addresses with balance > 0
					self.addresses = Wallet.addresses.filter(function(address){
						return ((address.privkey && address.privkey.length == 58) || address.pubkey)
					});

					self.buyBook = []
					self.sellBook = []

					$http.get("/v1/exchange/orders/book/pair/"+tradingPair.pair+"/"+tradingPair.property.currencyId)
						.then(function(response){
							if(response.status != "200" || response.data.status !="OK")
								return // handle errors

							
							var offers = response.data.orders
							offers.forEach(function(offerData){
								var order = null;
								var offer = new DExOffer(offerData);
								self.buyBook.forEach(function(orderData){
									if(orderData.price.eq(offer.price)){
										order = orderData;
										order.addOffer(offer)
									}
										
								})

								if(order == null){
									order = new DExOrder(offer);
									self.buyBook.push(order);
								}

							});

							self.buyBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return priceA.gt(priceB) ? -1 : priceA.lt(priceB) ? 1 : 0;
					        });
						})
					$http.get("/v1/exchange/orders/book/pair/"+tradingPair.property.currencyId+"/"+tradingPair.pair)
						.then(function(response){
							if(response.status != "200" || response.data.status !="OK")
								return // handle errors

							
							var offers = response.data.orders
							offers.forEach(function(offerData){
								var order = null;
								var offer = new DExOffer(offerData);
								self.sellBook.forEach(function(orderData){
									if(orderData.price.eq(offer.price)){
										order = orderData;
										order.addOffer(offer)
									}
								})
								if(order == null){
									order = new DExOrder(offer);
									self.sellBook.push(order);
								}


							});

							self.sellBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return priceA.lt(priceB) ? -1 : priceA.gt(priceB) ? 1 : 0;
					        });
						})

				};

				self.submitBuyOffer = function(){
					// TODO: Validations
					var fee = Account.settings.minerFee || MIN_MINER_FEE;
					var dexOffer = new Transaction(21,self.buyOrder.address,fee,{
							transaction_version:0,
							sale_currency_id:self.tradingPair.pair,
							sale_amount: new Big(self.buyOrder.amounts.pair).times(SATOSHI_UNIT).valueOf(),
							desired_currency_id:self.tradingPair.property.currencyId,
							desired_amount:new Big(self.buyOrder.amounts.property).times(SATOSHI_UNIT).valueOf(),
							action:1
						});
					ModalManager.openConfirmationModal({
						dataTemplate: '/views/modals/partials/dex_offer.html',
						scope: {
							title:"Confirm DEx Transaction",
							address:self.buyOrder.address,
							saleCurrency:self.tradingPair.pair,
							saleAmount:self.buyOrder.amounts.pair,
							desiredCurrency:self.tradingPair.property.currencyId,
							desiredAmount:self.buyOrder.amounts.property,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction",
							successMessage: "Your order was placed successfully"
						},
						transaction:dexOffer
					})
				};

				self.submitSellOffer = function(){
					// TODO: Validations
					var fee = Account.settings.minerFee || MIN_MINER_FEE;
					var dexOffer = new Transaction(21,self.sellOrder.address,fee,{
							transaction_version:0,
							sale_currency_id:self.tradingPair.property.currencyId,
							sale_amount:new Big(self.sellOrder.amounts.property).times(SATOSHI_UNIT).valueOf(),
							desired_currency_id:self.tradingPair.pair,
							desired_amount:new Big(self.sellOrder.amounts.pair).times(SATOSHI_UNIT).valueOf(),
							action:1 
						});
					ModalManager.openConfirmationModal({
						dataTemplate: '/views/modals/partials/dex_offer.html',
						scope: {
							title:"Confirm DEx Transaction",
							address:self.sellOrder.address,
							saleCurrency:self.tradingPair.pair,
							saleAmount:self.sellOrder.amounts.pair,
							desiredCurrency:self.tradingPair.property.currencyId,
							desiredAmount:self.sellOrder.amounts.property,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction",
							successMessage: "Your order was placed successfully"
						},
						transaction:dexOffer
					})
				};

				self.getBalance = function(address, assetId){
					return address && address.getBalance(assetId) ? new Big(address.getBalance(assetId).value).times(WHOLE_UNIT).valueOf() : 0;
				}

				self.initialize();
			}

			return Orderbook;
		}]);
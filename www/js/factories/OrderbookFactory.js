angular.module("omniFactories")
	.factory("Orderbook",["$http","DExOrder","DExOffer","Transaction","Account","Wallet","ModalManager","MIN_MINER_FEE", "WHOLE_UNIT", "SATOSHI_UNIT", 
		function OrderbookFactory($http,DExOrder,DExOffer,Transaction,Account,Wallet,ModalManager,MIN_MINER_FEE,WHOLE_UNIT,SATOSHI_UNIT){
			var Orderbook = function(tradingPair){
				var self = this;

				self.initialize = function(){
					self.tradingPair=tradingPair;
					self.title = "Trade #" + tradingPair.property + " for " + (tradingPair.pair == 1 ? "Mastercoin": "Test Mastercoin");
					self.active = true;
					self.disabled = !self.active;
					self.buyOrder = {};
					self.sellOrder = {};

					self.pair = Wallet.getAsset(tradingPair.pair);
					self.property = Wallet.getAsset(tradingPair.property);

					// TODO:  list only addresses with balance > 0
					self.addresses = Wallet.addresses.filter(function(address){
						return ((address.privkey && address.privkey.length == 58) || address.pubkey)
					});

					self.buyBook = []
					self.sellBook = []

					$http.get("/v1/exchange/orders/book/pair/"+tradingPair.pair+"/"+tradingPair.property)
						.then(function(response){
							if(response.status != "200" || response.data.status !="OK")
								return // handle errors

							var order = null;
							var offers = response.data.orders
							offers.forEach(function(offerData){
								var offer = new DExOffer(data);
								self.buyBook.forEach(function(orderData){
									if(orderData.price == offer.price)
										order = orderData;
								})
								if(order!= null){
									order.addOffer(offer)
								} else {
									order = new DExOrder(offer);
									self.buyBook.push(order);
								}


							});

							self.buyBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
					        });
						})
					$http.get("/v1/exchange/orders/book/pair/"+tradingPair.property+"/"+tradingPair.pair)
						.then(function(response){
							if(response.status != "200" || response.data.status !="OK")
								return // handle errors

							var order = null;
							var offers = response.data.orders
							offers.forEach(function(offerData){
								var offer = new DExOffer(data);
								self.sellBook.forEach(function(orderData){
									if(orderData.price == offer.price)
										order = orderData;
								})
								if(order!= null){
									order.addOffer(offer)
								} else {
									order = new DExOrder(offer);
									self.sellBook.push(order);
								}


							});

							self.sellBook.sort(function(a, b) {
					          var priceA = a.price;
					          var priceB = b.price;
					          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
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
							desired_currency_id:self.tradingPair.property,
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
							desiredCurrency:self.tradingPair.property,
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
							sale_currency_id:self.tradingPair.property,
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
							desiredCurrency:self.tradingPair.property,
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
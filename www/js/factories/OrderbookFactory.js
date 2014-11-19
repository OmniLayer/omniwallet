angular.module("omniFactories")
	.factory("Orderbook",["DExOffer","Transaction","Account","Wallet","ModalManager","MIN_MINER_FEE", "WHOLE_UNIT", 
		function OrderbookFactory(DExOffer,Transaction,Account,Wallet,ModalManager,MIN_MINER_FEE,WHOLE_UNIT){
			var Orderbook = function(tradingPair){
				var self = this;

				self.initialize = function(){
					self.tradingPair=tradingPair;
					self.title = "Trade #" + tradingPair.property + " for " + (tradingPair.pair == 1 ? "Mastercoin": "Test Mastercoin");
					self.active = true;
					self.disabled = !self.active;
					self.buy = new DExOffer();
					self.sell = new DExOffer();

					self.pair = Wallet.getAsset(tradingPair.pair);
					self.property = Wallet.getAsset(tradingPair.property);

					self.addresses = Wallet.addresses.filter(function(address){
						return ((address.privkey && address.privkey.length == 58) || address.pubkey)
					});

				};

				self.submitBuyOffer = function(){
					// TODO: Validations
					var fee = Account.settings.minerFee || MIN_MINER_FEE;
					var dexOffer = new Transaction(21,self.buy.address,fee,{
							transaction_version:0,
							sale_currency_id:self.tradingPair.pair,
							sale_amount:self.buy.amounts.pair,
							desired_currency_id:self.tradingPair.property,
							desired_amount:self.buy.amounts.property,
							action:1 // TODO: fill appropriate value
						});
					ModalManager.openConfirmationModal({
						dataTemplate: '/views/modals/partials/dex_offer.html',
						scope: {
							title:"Confirm DEx Transaction",
							address:self.buy.address,
							saleCurrency:self.tradingPair.pair,
							saleAmount:self.buy.amounts.pair,
							desiredCurrency:self.tradingPair.property,
							desiredAmount:self.buy.amounts.property,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction"
						},
						transaction:dexOffer
					})
				};

				self.submitSellOffer = function(){
					// TODO: Validations
					var fee = Account.settings.minerFee || MIN_MINER_FEE;
					var dexOffer = new Transaction(21,self.sell.address,fee,{
							transaction_version:0,
							sale_currency_id:self.tradingPair.property,
							sale_amount:self.buy.amounts.property,
							desired_currency_id:self.tradingPair.pair,
							desired_amount:self.buy.amounts.pair,
							action:1 // TODO: fill appropriate value
						});
					ModalManager.openConfirmationModal({
						dataTemplate: '/views/modals/partials/dex_offer.html',
						scope: {
							title:"Confirm DEx Transaction",
							address:self.sell.address,
							saleCurrency:self.tradingPair.pair,
							saleAmount:self.sell.amounts.pair,
							desiredCurrency:self.tradingPair.property,
							desiredAmount:self.sell.amounts.property,
							totalCost:dexOffer.totalCost,
							action:"Add",
							confirmText: "Create Transaction"
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
angular.module("omniControllers")
	.controller("DExOverviewController", ["$scope","Account","Orderbook","TransactionManager","Wallet",
		function DExOverviewController($scope,Account,Orderbook,TransactionManager,Wallet){
			$scope.isLoggedIn = Account.isLoggedIn;
			$scope.orderbooks = [];

			var DExSaleTransaction = new TransactionManager(21);

			$scope.switchOrderbook = function(propertyId){
				var active = null;
				var selected = null;
				$scope.orderbooks.forEach(function(orderbook){
					if(orderbook.tradingPair.property.id == propertyId)
						selected = orderbook;
					if(orderbook.active)
						active=orderbook;
				});
				if(selected==null){
					var tradingPair = {property:Wallet.getAsset(propertyId),pair: Wallet.getAsset(propertyId < 2147483651 ? 1 : 2)};
					selected = new Orderbook(DExSaleTransaction, tradingPair)
					$scope.orderbooks.push(selected);
				} else {
					selected.active = true;
				}
				if (active && active!= selected)
					active.active=false;
			}

			$scope.updateAmounts = function(order,price){
				order.amounts.pair = order.amounts.property * price;
			};
	}]);
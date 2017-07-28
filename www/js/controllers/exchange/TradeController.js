angular.module("omniControllers")
	.controller("ExchangeTradeController",["$scope", "PropertyManager","MIN_MINER_FEE","OMNI_PROTOCOL_COST",
		function ExchangeTradeController($scope, PropertyManager,MIN_MINER_FEE,PROTOCOL_FEE) {
		  $scope.minersFee = MIN_MINER_FEE;
		  $scope.protocolFee = PROTOCOL_FEE;
		  //init and use global to pass data around
		  $scope.global = {}

		  $scope.onTradeView = true
		  $scope.onSaleView = false;
		  $scope.onBuyView = false;
		  $scope.history = '/views/wallet/history.html';

		  if ($scope.account.loggedIn) {
			$scope.inactive = $scope.account.getSetting("filterdexdust");
		  } else {
			$scope.inactive = true;
		  }

		  $scope.setView = function(view, data) {
		    if (view != 'tradeInfo'){
		      if (view == 'saleOffer') {
		          $scope.onSaleView = true;
		          $scope.tradeView = $scope.tradeTemplates[view];
		          $scope.onTradeView = false;
		      }
		      else
		      {
		        $scope.tradeView = $scope.tradeTemplates[view];
		        $scope.onSaleView = false;
		        $scope.onTradeView = false;
		      }
		    }
		    else
		    {
		      $scope.tradeView = $scope.tradeTemplates[view];
		      $scope.onTradeView = true;
		      $scope.onSaleView = false;
		      $scope.showNoCoinAlert = false;
		    }
		    $scope.global[view] = data;
		  }

		  $scope.hideNoCoinAlert = function()
		  {
		    $scope.showNoCoinAlert = false;
		  }

		  $scope.$on("setView", function(event, args){
		    $scope.setView(args.view,args.data);
		  });
		  $scope.tradeTemplates = {
		    'tradeInfo': '/views/exchange/partials/overview.html',
		    'simpleSend': '/views/wallet/send.html',
		    'buyOffer': '/views/exchange/partials/buy.html',
		    'saleOffer': '/views/exchange/partials/sale.html'
		  };

		  //initialize the data used in the template
		  $scope.currPairs = []

		  PropertyManager.getProperty(1).then(function(result){
		  	var omni = result.data;
		  	omni.symbol  = "OMNI";
			if ($scope.account.loggedIn) {
			  	$scope.currPairs.splice(0,0,{0:$scope.wallet.getAsset(0),1:omni,active:true});
			} else {
				$scope.currPairs.splice(0,0,{0:{name:"Bitcoin",symbol:"BTC"},1:omni,active:true});
			}
		  	$scope.setActiveCurrencyPair();
		  })
		  if ( !$scope.account.loggedIn || $scope.account.getSetting("showtesteco") === 'true'){
		    PropertyManager.getProperty(2).then(function(result){
		    	var tomni = result.data;
		  		tomni.symbol  = "T-OMNI";
				if ($scope.account.loggedIn) {
				  	$scope.currPairs.splice(1,0,{0:$scope.wallet.getAsset(0),1:tomni});
				} else {
					$scope.currPairs.splice(0,0,{0:{name:"Bitcoin",symbol:"BTC"},1:tomni,active:true});
				}
			})
		  } 

		  if ($scope.account.loggedIn) {
			$scope.hasCoins = $scope.wallet.getAsset(1) != undefined;
			$scope.hasBitcoins = $scope.wallet.getAsset(0).tradable;
			$scope.selectedAsset = $scope.wallet.getAsset(1);
		  } else {
			$scope.hasCoins = false;
			$scope.hasBitcoins = false;
		  }

		  //Get the active currency pair
		  $scope.activeCurrencyPair = []

		  $scope.setActiveCurrencyPair = function(currencyPair) {
		    //DEBUG console.log(currencyPair);
		    if (!currencyPair)
		      $scope.activeCurrencyPair = $scope.currPairs[0]
		    else
		      $scope.activeCurrencyPair = currencyPair
		      if ($scope.account.loggedIn) {
			$scope.hasCoins = $scope.wallet.getAsset($scope.activeCurrencyPair[1].propertyid) != undefined;
		  	$scope.selectedAsset = $scope.wallet.getAsset($scope.activeCurrencyPair[1].propertyid);
		      } else {
			$scope.hasCoins = false;
		      }

		    var random = Math.random();
		    $scope.saleView = '/views/exchange/partials/sale.html?r='+random;
		    $scope.showNoCoinAlert = false;

		    // trigger getData
		    return true;
		  }
		}])

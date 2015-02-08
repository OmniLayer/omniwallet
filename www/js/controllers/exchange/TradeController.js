angular.module("omniControllers")
	.controller("ExchangeTradeController",["$scope", "PropertyManager",
		function ExchangeTradeController($scope, PropertyManager) {

		  //init and use global to pass data around
		  $scope.global = {}

		  $scope.onTradeView = true
		  $scope.history = '/views/wallet/history.html';

		  $scope.inactive = $scope.account.getSetting("filterdexdust");

		  $scope.setView = function(view, data) {
		    if (view != 'tradeInfo'){
		      if (view == 'saleOffer') {
		        if ($scope.hasCoins) {
		          $scope.onSaleView = true;
		          $scope.saleView = $scope.tradeTemplates[view];
		          $scope.onTradeView = false;
		        }
		        else
		        {
		          $scope.showNoCoinAlert = true;
		        }
		      }
		      else
		      {
		        $scope.tradeView = $scope.tradeTemplates[view];
		        $scope.onSaleView = false;
		        $scope.onTradeView = false;
		        $scope.showNoCoinAlert = false;
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
		  
		  $scope.setHasCoins = function(hideForm)
		  {
		    $scope.hasCoins = !hideForm;
		  }
		  $scope.tradeTemplates = {
		    'simpleSend': '/views/wallet/send.html',
		    'buyOffer': '/views/wallet/partials/buy.html',
		    'saleOffer': '/views/wallet/partials/sale.html'
		  };

		  //initialize the data used in the template
		  $scope.currPairs = []

		  PropertyManager.getProperty(1).then(function(result){
		  	var omni = result.data;
		  	omni.symbol  = "MSC";//"OMNI";
		  	$scope.currPairs.splice(0,0,{0:$scope.wallet.getAsset(0),1:omni,view:"/views/wallet/partials/trade.html"});
		  	$scope.setActiveCurrencyPair();
		  })
		  if ( $scope.account.getSetting("showtesteco") === 'true'){
		    PropertyManager.getProperty(2).then(function(result){
		    	var tomni = result.data;
		  		tomni.symbol  = "TMSC"; //"T-OMNI";
			  	$scope.currPairs.splice(1,0,{0:$scope.wallet.getAsset(0),1:tomni,view:"/views/wallet/partials/trade.html"});
			})
		  } 

		  //Get the active currency pair
		  $scope.activeCurrencyPair = []

		  $scope.setActiveCurrencyPair = function(currencyPair) {
		    //DEBUG console.log(currencyPair);
		    if (!currencyPair)
		      $scope.activeCurrencyPair = $scope.currPairs[0]
		    else
		      $scope.activeCurrencyPair = currencyPair

		    var random = Math.random();
		    $scope.saleView = '/views/wallet/partials/sale.html?r='+random;
		    $scope.showNoCoinAlert = false;
		  }
		}])
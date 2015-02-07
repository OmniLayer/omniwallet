angular.module("omniControllers")
	.controller("ExchangeTradeController",["$scope", "$http", "$q", 
		function ExchangeTradeController($scope, $http, $q) {

		  //init and use global to pass data around
		  $scope.global = {
		    getData: function() {}
		  }

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
		    'tradeInfo': '/views/exchange/info.html',
		    'simpleSend': '/views/wallet/send.html',
		    'buyOffer': '/views/exchange/buy.html',
		    'saleOffer': '/views/exchange/sale.html'
		  };

		  //initialize the data used in the template
		  $scope.currAcronyms = {
		    'BTC': 'Bitcoin',
		    'MSC': 'Mastercoin',
		    'TMSC': 'Test Mastercoin'
		  }
		  
		  if ( $scope.account.getSetting("showtesteco") === 'true'){
		    $scope.currPairs = [['BTC', 'MSC'], ['BTC', 'TMSC']];
		  } else {
		    $scope.currPairs = [['BTC', 'MSC']];
		  }

		  //Get the active currency pair
		  $scope.activeCurrencyPair = []

		  $scope.setActiveCurrencyPair = function(currencyPair) {
		    //DEBUG console.log(currencyPair);
		    if (!currencyPair)
		      $scope.activeCurrencyPair = $scope.currPairs[0]
		    else
		      $scope.activeCurrencyPair = currencyPair

		    $scope.global.getData();
		    var random = Math.random();
		    $scope.saleView = '/views/exchange/sale.html?r='+random;
		    $scope.showNoCoinAlert = false;
		  }
		  $scope.isActiveCurrencyPair = function(currencyPair) {
		    if (angular.equals(currencyPair, $scope.activeCurrencyPair))
		      return {
		        'active': 1
		      }
		    else
		      return {
		        'active': 0
		      }
		  }
		}])
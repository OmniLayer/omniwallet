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

}])

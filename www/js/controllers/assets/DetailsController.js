angular.module("omniControllers")
	.controller("AssetsDetailsController",["$location", "$route", "$scope", "$timeout", "$element", "$compile", "$http", "$templateCache", "PropertyManager", "ADDRESS_EXPLORER_URL",
		function AssetDetailsController($location, $route, $scope, $timeout, $element, $compile, $http, $templateCache, PropertyManager, ADDRESS_EXPLORER_URL){
		  // $scope initialization
		  $scope.explorerUrl=ADDRESS_EXPLORER_URL;
		  $scope.propertyId = $route.current.params.propertyId;
		  $scope.shareUrl = $location.absUrl();
		  $scope.property = {
		    
		  };
		  
		  $scope.property = {
		  	"name" : "",
		    "category" : "",
		    "subcategory" : "",
		    "data" : "",
		    "url" : "",
		    "divisible" : true,
		    "issuer" : "",
		    "creationtxid" : "",
		    "fixedissuance" : true,
		    "totaltokens" : 0,
		    "active" : true,
		    "propertyiddesired" : null,
		    "tokensperunit" : 0,
		    "earlybonus" : 0,
		    "percenttoissuer" : 0,
		    "starttime" : 0,
		    "deadline" : 0,
		    "amountraised" : 0,
		    "tokensissued" : 0,
		    "issuertokens" : 0
		  };
		  
		  $scope.isOwner = false;
		  $scope.acceptedCurrencies = [];
		  $scope.formatedStartDate = "";
		  $scope.daysAgo = 0;
		  $scope.earlyBirdBonus =  0;
		  $scope.estimatedWorth = "0";
		  $scope.history = {
		    total:0,
		    transactions:[],
		    loading:false,
		    loaded:false
		  };
		  $scope.infoMessage = $scope.account.loggedIn ? "You don't have the desired currency" : "Login to participate";
		  $scope.canParticipate = false;
		  $scope.loggedIn = $scope.account.loggedIn;
		  $scope.standoutError = $scope.loggedIn;
		  $scope.standoutInfo = !$scope.standoutError;

		  $scope.pendingThinking = true;
		  $scope.hasAddressesWithPrivkey = false;
		  $scope.selectedAddress = "";
		  $scope.selectedCoin = {name:"-- Loading coins --"};   
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807"; 
		  
		  // Finish $scope initialization

		  $scope.participate = function(){
		    $scope.pendingThinking = false;
		  };
		  
		  $scope.goBack = function(){
		    $scope.pendingThinking = true;
		  };
		  // Parsing and format functions
		  $scope.formatTransactionTime = function(blocktime, format){
		    format = format || "locale";
		    var time = new Date(blocktime * 1000);
		    if (format == "elapsed") {
		      var now = new Date();
		      var off = (now.getTime() / 1000) - blocktime;
		      if (off < 60)
		        return "Just now";
		      else if (off < 3600)
		        return Math.round(off / 60) + " minutes ago";
		      else if (off < 86400)
		        return Math.round(off / 3600) + " hours ago";
		      else if (off < 604800)
		        return Math.round(off / 86400) + " days ago";
		      else if (off < 2592000)
		        return Math.round(off / 604800) + " weeks ago";
		      else if (off < 31536000)
		        return Math.round(off / 2592000) + " months ago";
		      else
		        return Math.round(off / 31536000) + " years ago";
		      
		    } else {
		      return time.toLocaleString();
		    }
		  };
		  
		  $scope.formatCurrencyName = function (propertyid) {
		    var name = "Unknown";
		    $scope.acceptedCurrencies.forEach(function(currency){
		      if(currency.propertyid == propertyid)
		        name =  currency.name;
		    });
		    
		    return name;
		  };
		  
		  $scope.formatTransactionUrl = function (txid) {
		    return "http://blockchain.info/tx/"+txid;
		  };
		  
		  // Load property data into the page
		  $scope.loadHistory = function(){
		    if ($scope.history.loading || $scope.history.loaded) return;
		    $scope.history.loading=true;
		    
		    PropertyManager.getHistory($scope.propertyId,$scope.history.transactions.length,5).then(function(result){
		      $scope.history.total =  result.data.total;
		      for (var i = 0; i < result.data.transactions.length; i++) {
		        var tx = result.data.transactions[i];
		        tx.isParticipation = tx.type == 'Crowdsale Purchase';
		        tx.isClose = tx.type == 'Close Crowdsale';
		        tx.isCreate = tx.type.indexOf('Create Property') > -1;
		        $scope.history.transactions.push(tx);
		      }
		      $scope.history.loading=false;
		      if($scope.history.transactions.length == $scope.history.total)
		        $scope.history.loaded = true;
		    });
		  };
		  
		  // Load and initialize the form
		  PropertyManager.getProperty($scope.propertyId).then(function(result){
		    $scope.property = result.data;
		    if(!$scope.property.fixedissuance){
		      // format data
		      if($scope.property.tokensissued > 0){
			      var totalTokens = new Big($scope.property.totaltokens);
			      $scope.property.issuertokens = totalTokens.minus($scope.property.participanttokens);
		      }
		      
		      $scope.isOwner = $scope.account.loggedIn && 
		      					$scope.wallet.tradableAddresses()
		      					.map(function(address){return address.hash})
		      					.indexOf($scope.property.issuer) > -1;
		      PropertyManager.getProperty($scope.property.propertyiddesired).then(function(result){
		        $scope.acceptedCurrency = result.data;
		      });
		      
		      var startDate = new Date($scope.property.starttime*1000);
		      $scope.formatedStartDate = startDate.toLocaleDateString();
		      
		      var now = new Date();
		      $scope.daysAgo = Math.round((now.getTime() - startDate.getTime()) / (1000*60*60*24));
		      $scope.earlyBirdBonus =  ((($scope.property.deadline - (now.getTime()/1000)) / 604800) * $scope.property.earlybonus).toFixed(1);
		      $scope.estimatedWorth = "0";

		      if($scope.property.active){
		        // Participate form data
		        $scope.sendTo = $scope.property.issuer;
		        if($scope.account.loggedIn){
			        $scope.wallet.assets.filter(function(currency){
			             return currency.tradable;
			        }).forEach(function(coin){
			          if(coin.id==$scope.property.propertyiddesired){
			            $scope.selectedCoin = coin;    
			            $scope.canParticipate = true;
			            $scope.infoMessage = "Get some tokens!";
			            $scope.standoutError = false;
			            $scope.standoutInfo = true
			            $scope.tokenStep = $scope.tokenMin = coin.divisible ? 0.00000001 : 1;
			            $scope.tokenMax = coin.divisible ? "92233720368.54775807" : "9223372036854775807";
		              }
		        	});
		        }

		        // we need to compile the timer dinamically to get the appropiate end-date set.
		        var endtime = $scope.property.deadline * 1000;
		        $timeout(function (){
		        	return $http.get("/views/assets/partials/timer.html", {cache: $templateCache}).success(function(template) {
				      var timerNode = $(template.replace("{{endtime}}",endtime));
			          $element.find('#timerWrapper').append(timerNode);
			          $compile(timerNode)($scope);
				    });
		        });
		      }
		    }
		  });
		}])
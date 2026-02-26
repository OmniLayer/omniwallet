angular.module("omniControllers")
	.controller("AssetsDetailsController",["$location", "$route", "$scope", "$timeout", "$element", "$compile", "$http", "$templateCache", "PropertyManager", "ADDRESS_EXPLORER_URL","MIN_MINER_FEE", "Transaction",
		function AssetDetailsController($location, $route, $scope, $timeout, $element, $compile, $http, $templateCache, PropertyManager, ADDRESS_EXPLORER_URL, MIN_MINER_FEE, Transaction){
		  // $scope initialization
		  $scope.explorerUrl=ADDRESS_EXPLORER_URL;
		  $scope.propertyId = $route.current.params.propertyId;
		  $scope.shareUrl = $location.absUrl();
		  $scope.participation = {
		  	action:'details'
		  }
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
		    "issuertokens" : 0,
		    "iscrowdsale":false
		  };
		  
		  $scope.isOwner = false;
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
		        tx.isGrant = tx.type == 'Grant Property Tokens';
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
		      if($scope.property.deadline)
		      	$scope.property.iscrowdsale = true;
		      
		      $scope.isOwner = $scope.account.loggedIn && 
		      					$scope.wallet.tradableAddresses()
		      					.map(function(address){return address.hash})
		      					.indexOf($scope.property.issuer) > -1;

		      if($scope.property.propertyiddesired>0)
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
			            $scope.canParticipate = true;
		              }
		        	});
		        }

		        // we need to compile the timer dinamically to get the appropiate end-date set.
		        var endtime = $scope.property.deadline * 1000;
		        $timeout(function (){
		        	return $http.get("/views/assets/partials/crowdsale_timer.html", {cache: $templateCache}).success(function(template) {
				      var timerNode = $(template.replace("{{endtime}}",endtime));
			          $element.find('#timerWrapper').append(timerNode);
			          $compile(timerNode)($scope);
				    });
		        });
		      }
		    }
		  });
		}])
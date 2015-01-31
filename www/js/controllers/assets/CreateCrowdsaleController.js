angular.module("omniControllers")
	.controller("CreateCrowdsaleController",["$scope", "PropertyManager", "$timeout", "Transaction", "SATOSHI_UNIT", "ADDRESS_EXPLORER_URL",
		function CreateCrowdsaleController($scope, PropertyManager, $timeout, Transaction, SATOSHI_UNIT, ADDRESS_EXPLORER_URL){
		  $scope.ecosystem = 2;
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807";
		  $scope.categories = [];
		  $scope.subcategories = [];
		  $scope.availableTokens = [];
		  $scope.issuerData = {};
		  $scope.propertyDetails = {propertyType : 2, propertyCategory : ''};
		  
		  var mastercoin, testMastercoin, bitcoin;
		  $scope.setEcosystem = function(){
		    PropertyManager.listProperties($scope.ecosystem).then(function(result){
		    	result.data.properties.forEach(function(property){
		    		if(property.currencyId==0)
		    			bitcoin=property;
		    		else if(property.currencyId==1)
		    			mastercoin=property;
		    		else if(property.currencyId==2)
		    			testMastercoin=property;
		    	})
		      $scope.availableTokens = result.data.properties.sort(function(a, b) {
		          var currencyA = a.propertyName.toUpperCase();
		          var currencyB = b.propertyName.toUpperCase();
		          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
		      });
		      $scope.selectedCurrency = $scope.ecosystem == 1 ? mastercoin : testMastercoin;
		    });
		    $scope.categories=[];
		    $scope.subcategories=[];
		    $scope.loadCategories();
		  };
		  
		  $scope.loadCategories=function(){
		    PropertyManager.loadCategories($scope.ecosystem).then(function(result){  
		      $scope.categories=result.data.categories.sort();
		    });
		  };

		  $scope.loadSubcategories=function(category){
		    $scope.propertyDetails.propertySubcategory = '';
		    PropertyManager.loadSubcategories($scope.ecosystem, category).then(function(result){  
		      $scope.subcategories=result.data.subcategories.sort();
		    });
		  };
		  
		  $scope.formatCurrencyDisplay = function(currencyDesired){
		    return currencyDesired.propertyName + " (" + currencyDesired.currencyId + ")";
		  };
		  
		  // Initialize the form
		  $scope.setEcosystem();
		  
		  $scope.isDivisible=function(){
		    return $scope.propertyDetails.propertyType == 2 || $scope.propertyDetails.propertyType == 66 || $scope.propertyDetails.propertyType == 130;
		  };

		  // Estimated early bird bonus calculation
		  $scope.$watch(function(){ return $scope.deadline ? $scope.deadline.getTime() + $scope.earlyBirdBonus : 0;}, function(value){
		    if(value > 0){
		      var utcNow = new Date((new Date()).getTime() + (new Date()).getTimezoneOffset() * 60000);
		      $scope.initialEarlyBirdBonus = (((($scope.deadline.getTime() / 1000) - (utcNow.getTime() /1000 + 1800)) /604800 ) * $scope.earlyBirdBonus).toFixed(2);
		      $scope.initialEarlyBirdBonus = $scope.initialEarlyBirdBonus > 0 ? $scope.initialEarlyBirdBonus : 0.00;
		    } else 
		      $scope.initialEarlyBirdBonus = 0
		  });
		  
		  $scope.typeChanged = function(){
		    $scope.tokenStep = $scope.tokenMin = $scope.isDivisible() ? 0.00000001 : 1;
		    $scope.tokenMax = $scope.isDivisible() ? "92233720368.54775807" : "9223372036854775807";
		  };
		  
		  // TRASANCTION GENERATION CONFIG 
		  $scope.confirm = function(){
		  	//TODO: VALIDATIONS
		  	var fee = new Big($scope.issuerData.minerFees);
			var crowdsaleCreation = new Transaction(51,$scope.issuerData.selectedAddress,fee,{
		          transaction_version:0,
		          ecosystem:$scope.ecosystem,
		          property_type : $scope.propertyDetails.propertyType, 
		          previous_property_id: 0, 
		          property_category:$scope.propertyDetails.propertyCategory || '\0', 
		          property_subcategory:$scope.propertyDetails.propertySubcategory || '\0', 
		          property_name:$scope.propertyDetails.propertyName, 
		          property_url:$scope.propertyDetails.propertyUrl || '\0', 
		          property_data:$scope.propertyDetails.propertyData || '\0', 
		          number_properties:$scope.isDivisible() ? +new Big($scope.numberOfTokens).times(SATOSHI_UNIT).valueOf() : +$scope.numberOfTokens,
		          currency_identifier_desired:$scope.selectedCurrency.currencyId,
		          deadline:Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0) / 1000,
		          earlybird_bonus:$scope.earlyBirdBonus,
		          percentage_for_issuer:$scope.percentageForIssuer,
		          donate: $scope.account.getSetting("donate")
		        });


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/crowdsale.html',
				scope:{
					title:"ASSET_CROWDSALE_MODALTITLE",
				    divisible : $scope.isDivisible(),
				    propertyName : $scope.propertyDetails.propertyName,
				    propertyData : $scope.propertyDetails.propertyData,
				    propertyCategory : $scope.propertyDetails.propertyCategory,
				    propertySubcategory : $scope.propertyDetails.propertySubcategory,
				    propertyUrl : $scope.propertyDetails.propertyUrl,
				    selectedCurrency : $scope.selectedCurrency,
				    numberOfTokens: $scope.numberOfTokens,
				    deadline : (new Date(Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0))).toUTCString(),
				    earlyBirdBonus : $scope.initialEarlyBirdBonus,
				    percentageForIssuer : $scope.percentageForIssuer,
				    fees : $scope.issuerData.minerFees,
				    totalCost : crowdsaleCreation.totalCost,
					confirmText:"ASSET_CROWDSALE_START",
					explorerUrl:ADDRESS_EXPLORER_URL
				},
				transaction:crowdsaleCreation
			})
		  }
		  
		  // DATEPICKER CONFIGURATION
		  var deadline = new Date();
		  var offset = deadline.getTimezoneOffset() * 60000;
		  // set mn deadline to be half an hour ahead
		  var minDeadline = new Date(deadline.getTime() + 1800000 - offset);
		  $scope.today = function() {
		    $scope.deadline = minDeadline;
		  };
		  
		  deadline.setMonth(deadline.getMonth() +1);
		  $scope.deadline = new Date(deadline.getTime() - offset);

		  $scope.open = function($event) {
		    $event.preventDefault();
		    $event.stopPropagation();

		    $scope.opened = true;
		  };
		  
		  // Disable past dates
		  $scope.disabled = function(date, mode) {
		    return ( mode === 'day' && date.getTime() < (new Date()).getTime());
		  };
		  
		  $scope.dateOptions = {
		    formatYear: 'yy',
		    startingDay: 1,
		    minDate:minDeadline
		  };
		  
		  $scope.format = 'dd MMMM yyyy';
		  
		  $scope.$watch('deadline', function(value){
		    if (value < minDeadline) $scope.deadline = minDeadline;
		  });
		}])
angular.module("omniControllers")
	.controller("CreateCrowdsaleController",["$scope", "PropertyManager", "$timeout", "Transaction", "ModalManager", "SATOSHI_UNIT",
		function CreateCrowdsaleController($scope, PropertyManager, $timeout, Transaction, ModalManager, SATOSHI_UNIT){
		  $scope.ecosystem = 2;
		  $scope.propertyType = 2;
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807";
		  $scope.singleCurrency = true;
		  var availableDesiredCurrencies=[];
		  var selectedDesiredCurrencies=[];
		  $scope.categories=[];
		  $scope.subcategories=[];
		  $scope.currenciesDesired=[];
		  $scope.propertyCategory='';
		  
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
		      availableDesiredCurrencies = result.data.properties.sort(function(a, b) {
		          var currencyA = a.propertyName.toUpperCase();
		          var currencyB = b.propertyName.toUpperCase();
		          return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
		      });
		      var availableTokens = availableDesiredCurrencies.filter(function(currency){
		        return selectedDesiredCurrencies.indexOf(currency) == -1;
		      });
		      var selectedCurrency = $scope.ecosystem == 1 ? mastercoin : testMastercoin;
		      $scope.currenciesDesired =[{numberOfTokens:"", selectedCurrency:selectedCurrency, previousCurrency:selectedCurrency, availableTokens:availableTokens}];
		      selectedDesiredCurrencies.push(selectedCurrency);
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
		    $scope.propertySubcategory = '';
		    PropertyManager.loadSubcategories($scope.ecosystem, category).then(function(result){  
		      $scope.subcategories=result.data.subcategories.sort();
		    });
		  };
		  
		  // MULTIPLE CURRENCIES SUPPORT
		  $scope.addCurrencyDesired=function(){
		    if(availableDesiredCurrencies.length - selectedDesiredCurrencies.length > 0) {
		      var availableTokens = availableDesiredCurrencies.filter(function(currency){
		        return selectedDesiredCurrencies.indexOf(currency) == -1;
		      });
		      var selectedCurrency = availableTokens.indexOf(mastercoin) > -1 ? mastercoin : availableTokens.indexOf(bitcoin) > -1 ? bitcoin : availableTokens[0];
		      var newCurrencyDesired = {numberOfTokens:"", selectedCurrency:selectedCurrency, previousCurrency:selectedCurrency, availableTokens:availableTokens};
		      $scope.setAvailableTokens(newCurrencyDesired);
		      $scope.currenciesDesired.push(newCurrencyDesired);
		    }
		    
		    $scope.singleCurrency=selectedDesiredCurrencies.length == 1;
		  };
		  
		  $scope.setAvailableTokens=function(currencyDesired){
		    $scope.currenciesDesired.forEach(function(currency){
		      if(currency != currencyDesired){
		        if(currency.availableTokens.indexOf(currencyDesired.previousCurrency) == -1)
		          currency.availableTokens.push(currencyDesired.previousCurrency);
		        currency.availableTokens.splice(currency.availableTokens.indexOf(currencyDesired.selectedCurrency),1);
		        currency.availableTokens.sort(function(a, b) {
		            var currencyA = a.propertyName.toUpperCase();
		            var currencyB = b.propertyName.toUpperCase();
		            return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
		        });
		      };
		    });
		    if(selectedDesiredCurrencies.indexOf(currencyDesired.previousCurrency) != -1)
		      selectedDesiredCurrencies.splice(selectedDesiredCurrencies.indexOf(currencyDesired.previousCurrency),1);
		    selectedDesiredCurrencies.push(currencyDesired.selectedCurrency);
		    currencyDesired.previousCurrency=currencyDesired.selectedCurrency;
		  };
		  
		  $scope.removeCurrencyDesired = function(currencyDesired){
		    selectedDesiredCurrencies.splice(selectedDesiredCurrencies.indexOf(currencyDesired.selectedCurrency),1);
		    $scope.currenciesDesired.splice($scope.currenciesDesired.indexOf(currencyDesired),1);
		    $scope.currenciesDesired.forEach(function(currency){
		        currency.availableTokens.push(currencyDesired.selectedCurrency);
		        currency.availableTokens.sort(function(a, b) {
		            var currencyA = a.propertyName.toUpperCase();
		            var currencyB = b.propertyName.toUpperCase();
		            return (currencyA < currencyB) ? -1 : (currencyA > currencyB) ? 1 : 0;
		        });
		    });
		    $scope.singleCurrency=selectedDesiredCurrencies.length == 1;
		  };
		  
		  $scope.formatCurrencyDisplay = function(currencyDesired){
		    return currencyDesired.propertyName + " (" + currencyDesired.currencyId + ")";
		  };

		  $scope.$watch(function(){ return selectedDesiredCurrencies.length;}, function(count){
		    $scope.singleCurrency = count == 1;
		  });
		  
		  // Initialize the form
		  $scope.setEcosystem();
		  
		  $scope.isDivisible=function(){
		    return $scope.propertyType == 2 || $scope.propertyType == 66 || $scope.propertyType == 130;
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
		  	var fee = $scope.minersFee;
			var crowdsaleCreation = new Transaction(51,$scope.selectedAddress,fee,{
		          transaction_version:0,
		          ecosystem:$scope.ecosystem,
		          property_type : $scope.propertyType, 
		          previous_property_id:$scope.previousPropertyId || 0, 
		          property_category:$scope.propertyCategory || '\0', 
		          property_subcategory:$scope.propertySubcategory || '\0', 
		          property_name:$scope.propertyName, 
		          property_url:$scope.propertyUrl || '\0', 
		          property_data:$scope.propertyData || '\0', 
		          number_properties:$scope.isDivisible() ? +new Big(currency.numberOfTokens).times(SATOSHI_UNIT).valueOf() : +currency.numberOfTokens,
		          transaction_from: $scope.selectedAddress,
		          currency_identifier_desired:currency.selectedCurrency.currencyId,
		          deadline:Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0) / 1000,
		          earlybird_bonus:$scope.earlyBirdBonus,
		          percentage_for_issuer:$scope.percentageForIssuer,
		          fee: $scope.convertDisplayedValue($scope.minerFees),
		          testnet: (TESTNET || false),
		          donate: Account.getSetting("donate")
		        });


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/crowdsale.html',
				scope:{
					title:"ASSETS_CROWDSALE_MODALTITLE",
				    divisible : $scope.isDivisible(),
				    propertyName : $scope.propertyName,
				    propertyData : $scope.propertyData,
				    propertyCategory : $scope.propertyCategory,
				    propertySubcategory : $scope.propertySubcategory,
				    propertyUrl : $scope.propertyUrl,
				    currenciesDesired : $scope.currenciesDesired,
				    deadline : (new Date(Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0))).toUTCString(),
				    earlyBirdBonus : $scope.initialEarlyBirdBonus,
				    percentageForIssuer : $scope.percentageForIssuer,
				    selectedAddress : $scope.selectedAddress,
				    fees : $scope.minerFees,
				    totalCost : crowdsaleCreation.totalCost,
					confirmText:"ASSETS_CROWDSALE_START"
				},
				transaction:crowdsaleCreation
			})
		  }
		  
		  // DATEPICKER CONFIGURATION
		  var nextMonth = new Date();
		  var offset = nextMonth.getTimezoneOffset() * 60000;
		  var minDeadline = new Date((new Date()).getTime() + 1800000 + offset);
		  $scope.today = function() {
		    $scope.deadline = minDeadline;
		  };
		  
		  nextMonth.setMonth(nextMonth.getMonth() +1);
		  $scope.deadline = new Date(nextMonth.getTime() + offset);

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
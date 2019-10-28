angular.module("omniControllers")
	.controller("AssetsCrowdsaleController",["$scope", "PropertyManager", "$timeout", "Transaction", "SATOSHI_UNIT", "ADDRESS_EXPLORER_URL", "$filter",
		function AssetsCrowdsaleController($scope, PropertyManager, $timeout, Transaction, SATOSHI_UNIT, ADDRESS_EXPLORER_URL, $filter){
		  $scope.tokenStep = $scope.tokenMin =  0.00000001;
		  $scope.tokenMax = "92233720368.54775807";
		  $scope.categories = [];
		  $scope.subcategories = [];
		  $scope.availableTokens = [];
		  $scope.issuerData = {};
		  $scope.propertyDetails = {propertyType : 2, propertyCategory : ''};
		  
		  var mastercoin, testMastercoin, bitcoin;
		  $scope.setEcosystem = function(ecosystem){
		  	$scope.ecosystem=ecosystem;
		    PropertyManager.listByEcosystem($scope.ecosystem).then(function(result){
		    	result.data.properties.forEach(function(property){
		    		if(property.propertyid==0)
		    			bitcoin=property;
		    		else if(property.propertyid==1)
		    			mastercoin=property;
		    		else if(property.propertyid==2)
		    			testMastercoin=property;
		    	})
		      $scope.availableTokens = result.data.properties.sort(function(a, b) {
		          var currencyA = a.name.toUpperCase();
		          var currencyB = b.name.toUpperCase();
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
		    return $filter('truncate')(currencyDesired.name, 15, 0) + " (" + currencyDesired.propertyid + ")";
		  };
		  
		  // Initialize the form
		  $scope.setEcosystem(2);
		  
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
		          property_category:$scope.propertyDetails.propertyCategory || '', 
		          property_subcategory:$scope.propertyDetails.propertySubcategory || '', 
		          property_name:$scope.propertyDetails.propertyName, 
		          property_url:$scope.propertyDetails.propertyUrl || '', 
		          property_data:$scope.propertyDetails.propertyData || '', 
		          number_properties: +new Big($scope.numberOfTokens).valueOf(),
		          currency_identifier_desired:$scope.selectedCurrency.propertyid,
		          deadline:Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0) / 1000,
		          earlybird_bonus:$scope.earlyBirdBonus,
		          percentage_for_issuer:$scope.percentageForIssuer,
		          donate: $scope.account.getSetting("donate")
		        });


			$scope.modalManager.openConfirmationModal({
				dataTemplate: '/views/modals/partials/crowdsale.html',
				scope:{
					title:"ASSET.CROWDSALE.MODALTITLE",
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
					confirmText:"ASSET.CROWDSALE.START",
					explorerUrl:ADDRESS_EXPLORER_URL,
            		successRedirect:"/wallet/assets"
				},
				transaction:crowdsaleCreation
			})
		  }

		  // transactionGenerationController.validateTransactionData = function(){
		  //   var dustValue = 5757;
		  //   var minerMinimum = 10000;
		  //   var nonZeroValue = 1;

		  //   var convertToSatoshi = [
		  //     $scope.minerFees,
		  //     $scope.balanceData[1]
		  //   ];
		    
		  //   var convertedValues =$scope.convertDisplayedValue(convertToSatoshi);
		  //   var minerFees = +convertedValues[0];
		  //   var btcbalance = convertedValues[1];
		  //   var propertyName=$scope.propertyName;
		    
		  //   var error = 'Please ';
		  //   if ($scope.issuanceForm.$valid == false) {
		  //     error += 'make sure all fields are completely filled, ';
		  //   }
		  //   if (minerFees < minerMinimum)
		  //     error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
		  //   if ((minerFees <= btcbalance) == false)
		  //       error += 'make sure you have enough Bitcoin to cover your fees, ';
		  //   if (!propertyName || propertyName == '\0')
		  //     error += 'make sure you enter a Property Name, ';
		    
		  //   return error;
		  // };
		  
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

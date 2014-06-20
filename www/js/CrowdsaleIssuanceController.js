function CrowdsaleIssuanceController($scope, propertiesService){
  /*
  $scope.isNewProperty = true;
  
  $scope.checkPropertyType = function(){
    if ($scope.propertyType != 1 && $scope.propertyType != 2)
      $scope.isNewProperty = false;
    else
      $scope.isNewProperty = true;
  };*/
 
  var transactionGenerationController = $scope.$parent;
  $scope.ecosystem = 1;
  $scope.propertyType = 2;
  $scope.singleCurrency = true;
  var availableDesiredCurrencies=[];
  var selectedDesiredCurrencies=[];
  $scope.categories=[];
  $scope.subcategories=[];
  $scope.currenciesDesired=[];
  
  $scope.setEcosystem = function(){
    availableDesiredCurrencies=$scope.ecosystem == 1 ? [{currencyId:1,propertyName:"Mastercoin"},{currencyId:0,propertyName:"Bitcoin"}]:[{currencyId:2,propertyName:"Test Mastercoin"}];
    propertiesService.list($scope.ecosystem).then(function(result){
      availableDesiredCurrencies = availableDesiredCurrencies.concat(result.data.properties);
      var availableTokens = availableDesiredCurrencies.filter(function(currency){
        return selectedDesiredCurrencies.indexOf(currency) == -1;
      });
      $scope.currenciesDesired =[{numberOfTokens:"", selectedCurrency:availableTokens[0] , previousCurrency:availableTokens[0], availableTokens:availableTokens}];
      selectedDesiredCurrencies.push(availableTokens[0]);
    });
    $scope.categories=[];
    $scope.subcategories=[];
    $scope.loadCategories();
  };
  
  $scope.loadCategories=function(){
    propertiesService.loadCategories($scope.ecosystem).then(function(result){  
      $scope.categories=result.data.categories;
    });
  };
  $scope.loadSubcategories=function(category){
    propertiesService.loadSubcategories($scope.ecosystem, category).then(function(result){  
      $scope.subcategories=result.data.subcategories;
    });
  };
  
  $scope.setDeadlineTime=function(time){
    $scope.deadline.setHours(time.hours);
    $scope.deadline.setMinutes(time.minute);
    $scope.deadline.setSeconds(0);
  };
  
  
  // MULTIPLE CURRENCIES SUPPORT
  $scope.addCurrencyDesired=function(){
    if(availableDesiredCurrencies.length - selectedDesiredCurrencies.length > 0) {
      var availableTokens = availableDesiredCurrencies.filter(function(currency){
        return selectedDesiredCurrencies.indexOf(currency) == -1;
      });
      var newCurrencyDesired = {numberOfTokens:"", selectedCurrency:availableTokens[0] , previousCurrency:availableTokens[0], availableTokens:availableTokens};
      $scope.setAvailableTokens(newCurrencyDesired);
      $scope.currenciesDesired.push(newCurrencyDesired);
    }
  };
  
  $scope.setAvailableTokens=function(currencyDesired){
    $scope.currenciesDesired.forEach(function(currency){
      if(currency != currencyDesired){
        if(currency.availableTokens.indexOf(currencyDesired.previousCurrency) == -1)
          currency.availableTokens.push(currencyDesired.previousCurrency);
        currency.availableTokens.splice(currency.availableTokens.indexOf(currencyDesired.selectedCurrency),1);
        currency.availableTokens.sort(function(a,b){
          return a.propertyName;
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
        currency.availableTokens.sort(function(a,b){
          return a.propertyName;
        });
    });
  };
  
  $scope.formatCurrencyDisplay = function(currencyDesired){
    return currencyDesired.propertyName + " (" + currencyDesired.currencyId + ")";
  };
  
  // Initialize the form
  $scope.setEcosystem();
  
  $scope.$watch(function(){ return selectedDesiredCurrencies.length;}, function(count){
    $scope.singleCurrency = count == 1;
  });
  
  
  // TRASANCTION GENERATION CONFIG 
  transactionGenerationController.validateTransactionData = function(){
    var dustValue = 5757;
    var minerMinimum = 10000;
    var nonZeroValue = 1;

    var convertToSatoshi = [
      $scope.minerFees,
      $scope.balanceData[1]
    ];
    
    var convertedValues =$scope.convertDisplayedValue(convertToSatoshi);
    var minerFees = +convertedValues[0];
    var btcbalance = convertedValues[1];
    var numberProperties=$scope.numberProperties,
    propertyType = $scope.propertyType,
    previousPropertyId=$scope.previousPropertyId,
    propertyName=$scope.propertyName,
    propertyCategory=$scope.propertyCategory,
    propertySubcategory=$scope.propertySubcategory,
    propertyUrl=$scope.propertyUrl,
    currencyIdentifierDesired=$scope.currencyIdentifierDesired.id,
    currencyIdentifierDesiredName=$scope.currencyIdentifierDesired.symbol,
    deadline=$scope.deadline,
    earlyBirdBonus=$scope.earlyBirdBonus,
    percentageForIssuer=$scope.percentageForIssuer;
    
    var error = 'Please ';
    if ($scope.issuanceForm.$valid == false) {
      error += 'make sure all fields are completely filled, ';
    }
    if (minerFees < minerMinimum)
      error += 'make sure your fee entry is at least 0.0001 BTC to cover miner costs, ';
    if ((minerFees <= btcbalance) == false)
        error += 'make sure you have enough Bitcoin to cover your fees, ';
    if (!propertyName || propertyName == '\0')
      error += 'make sure you enter a Property Name, ';
    
    return error;
  };
  
  transactionGenerationController.modalTemplateUrl = '/partials/wallet_assets_crowdsale_modal.html';
  
  transactionGenerationController.setModalScope = function($modalScope){
    $modalScope.issueSuccess = false, $modalScope.issueError = false, $modalScope.waiting = false, $modalScope.privKeyPass = {};
    $modalScope.convertSatoshiToDisplayedValue=  $scope.convertSatoshiToDisplayedValue,
    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
    $modalScope.numberProperties=  $scope.numberProperties,
    $modalScope.propertyTypeName=  $scope.propertyType == 1 || $scope.propertyType == 65 || $scope.propertyType == 129? 'Indivisible' : 'Divisible',
    $modalScope.propertyName= $scope.propertyName,
    $modalScope.propertyCategory= $scope.propertyCategory,
    $modalScope.propertySubcategory= $scope.propertySubcategory,
    $modalScope.propertyUrl= $scope.propertyUrl,
    $modalScope.currencyIdentifierDesiredName=$scope.currencyIdentifierDesired.symbol,
    $modalScope.deadline=$scope.deadline.toLocaleDateString(),
    $modalScope.earlyBirdBonus=$scope.earlyBirdBonus,
    $modalScope.percentageForIssuer=$scope.percentageForIssuer;
  };
  
  transactionGenerationController.generateData = function(){
    return {
      from:$scope.selectedAddress,
      transactionType:51,
      transactionData:{
        transaction_version:0,
        ecosystem:2,
        property_type : $scope.propertyType, 
        previous_property_id:$scope.previousPropertyId || 0, 
        property_category:$scope.propertyCategory, 
        property_subcategory:$scope.propertySubcategory, 
        property_name:$scope.propertyName, 
        property_url:$scope.propertyUrl, 
        property_data:'\0', 
        number_properties:$scope.numberProperties,
        transaction_from: $scope.selectedAddress,
        currency_identifier_desired:$scope.currencyIdentifierDesired.id,
        deadline:$scope.deadline.getTime(),
        earlybird_bonus:$scope.earlyBirdBonus,
        percentage_for_issuer:$scope.percentageForIssuer
      }
    };
  };
  
  // DATEPICKER OPTIONS
  $scope.today = function() {
    $scope.deadline= new Date();
  };
  $scope.today();

  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };
  
  $scope.format = 'dd-MMMM-yyyy';
}

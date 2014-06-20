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
    var propertyName=$scope.propertyName;
    
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
    $modalScope.divisible=  $scope.propertyType == 1 || $scope.propertyType == 65 || $scope.propertyType == 129? 'No' : 'Yes',
    $modalScope.propertyName= $scope.propertyName,
    $modalScope.propertyData= $scope.propertyData,
    $modalScope.propertyCategory= $scope.propertyCategory,
    $modalScope.propertySubcategory= $scope.propertySubcategory,
    $modalScope.propertyUrl= $scope.propertyUrl,
    $modalScope.currenciesDesired=$scope.currenciesDesired,
    $modalScope.deadline=$scope.deadline.toLocaleDateString(),
    $modalScope.earlyBirdBonus=$scope.earlyBirdBonus,
    $modalScope.percentageForIssuer=$scope.percentageForIssuer;
  };
  
  transactionGenerationController.generateData = function(){
    var transactionData = [];
    $scope.currenciesDesired.forEach(function(currency,index){
      if(index == 0){
        transactionData.push({
          transaction_version:1,
          ecosystem:$scope.ecosystem,
          property_type : $scope.propertyType, 
          previous_property_id:$scope.previousPropertyId || 0, 
          property_category:$scope.propertyCategory, 
          property_subcategory:$scope.propertySubcategory, 
          property_name:$scope.propertyName, 
          property_url:$scope.propertyUrl, 
          property_data:$scope.propertyData || '\0', 
          number_properties:currency.numberOfTokens,
          transaction_from: $scope.selectedAddress,
          currency_identifier_desired:currency.currencyId,
          deadline:$scope.deadline.getTime(),
          earlybird_bonus:$scope.earlyBirdBonus,
          percentage_for_issuer:$scope.percentageForIssuer
        });
      } else {
        transactionData.push({
          transaction_version:1,
          ecosystem:$scope.ecosystem,
          property_type : 0, 
          previous_property_id:0, 
          property_category:'\0', 
          property_subcategory:'\0', 
          property_name:'\0', 
          property_url:'\0', 
          property_data:'\0', 
          number_properties:currency.numberOfTokens,
          transaction_from: $scope.selectedAddress,
          currency_identifier_desired:currency.currencyId,
          deadline:0,
          earlybird_bonus:0,
          percentage_for_issuer:0
        });
      }
    });
    return {
      from:$scope.selectedAddress,
      transactionType:51,
      transactionData:transactionData
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

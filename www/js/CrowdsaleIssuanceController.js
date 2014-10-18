function CrowdsaleIssuanceController($scope, propertiesService, $timeout, $injector, $modal){

  $scope.walletAssets = $scope.$parent.$parent;
  $scope.walletAssets.currencyList.forEach(function(e, i) {
    if (e.symbol == "BTC")
      $scope.walletAssets.selectedCoin = e;
  });
  // Enable the transaction for offline wallets
  $scope.walletAssets.offlineSupport=true;
  var transactionGenerationController = $scope.$parent;
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
  
  var mastercoin ={currencyId:1,propertyName:"Mastercoin"};
  var bitcoin = {currencyId:0,propertyName:"Bitcoin"};
  var testMastercoin = {currencyId:2,propertyName:"Test Mastercoin"};
  
  $scope.setEcosystem = function(){
    availableDesiredCurrencies=$scope.ecosystem == 1 ? [mastercoin,bitcoin]:[testMastercoin];
    propertiesService.list($scope.ecosystem).then(function(result){
      availableDesiredCurrencies = availableDesiredCurrencies.concat(result.data.properties).sort(function(a, b) {
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
    propertiesService.loadCategories($scope.ecosystem).then(function(result){  
      $scope.categories=result.data.categories.sort();
    });
  };
  $scope.loadSubcategories=function(category){
    $scope.propertySubcategory = '';
    propertiesService.loadSubcategories($scope.ecosystem, category).then(function(result){  
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
  
  // Initialize the form
  $scope.setEcosystem();
  
  $scope.isDivisible=function(){
    return $scope.propertyType == 2 || $scope.propertyType == 66 || $scope.propertyType == 130;
  };
  
  $scope.$watch(function(){ return selectedDesiredCurrencies.length;}, function(count){
    $scope.singleCurrency = count == 1;
  });
  
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
    $modalScope.divisible= $scope.isDivisible() ? 'Yes' : 'No',
    $modalScope.propertyName= $scope.propertyName,
    $modalScope.propertyData= $scope.propertyData,
    $modalScope.propertyCategory= $scope.propertyCategory,
    $modalScope.propertySubcategory= $scope.propertySubcategory,
    $modalScope.propertyUrl= $scope.propertyUrl,
    $modalScope.currenciesDesired=$scope.currenciesDesired,
    $modalScope.deadline=(new Date(Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0))).toUTCString(),
    $modalScope.earlyBirdBonus= $scope.initialEarlyBirdBonus,
    $modalScope.percentageForIssuer=$scope.percentageForIssuer;
    $modalScope.selectedAddress=$scope.selectedAddress;
    $modalScope.minerFees= +$scope.convertDisplayedValue($scope.minerFees);
    $modalScope.totalCost= +$scope.convertDisplayedValue($scope.totalCost);
    $modalScope.expanded = true;
    $modalScope.rendered = false;
    $modalScope.setExpandableDiv = function(){
      $timeout(function(){
        $scope.$apply(function(){
          var offsetHeight = document.getElementById('expandable-div').offsetHeight;
          var lines = offsetHeight/25;
          if (lines > 2) {
            $modalScope.longText = true;
            $modalScope.expanded = false;
          }
          else {
            $modalScope.longText = false;
            $modalScope.expanded = true;
          } 
        });   
      },0,false);  
    }
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
          property_category:$scope.propertyCategory || '\0', 
          property_subcategory:$scope.propertySubcategory || '\0', 
          property_name:$scope.propertyName, 
          property_url:$scope.propertyUrl || '\0', 
          property_data:$scope.propertyData || '\0', 
          number_properties:$scope.isDivisible() ? +$scope.convertDisplayedValue(currency.numberOfTokens) : +currency.numberOfTokens,
          transaction_from: $scope.selectedAddress,
          currency_identifier_desired:currency.selectedCurrency.currencyId,
          deadline:Date.UTC($scope.deadline.getFullYear(),$scope.deadline.getMonth(),$scope.deadline.getDate(), $scope.deadline.getHours(), $scope.deadline.getMinutes(), 0, 0) / 1000,
          earlybird_bonus:$scope.earlyBirdBonus,
          percentage_for_issuer:$scope.percentageForIssuer,
          fee: $scope.convertDisplayedValue($scope.minerFees)
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
          number_properties: $scope.isDivisible() ? +$scope.convertDisplayedValue(currency.numberOfTokens) : +currency.numberOfTokens,
          transaction_from: $scope.selectedAddress,
          currency_identifier_desired:currency.selectedCurrency.currencyId,
          deadline:0,
          earlybird_bonus:0,
          percentage_for_issuer:0,
          fee: $scope.convertDisplayedValue($scope.minerFees)
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
  
  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && date.getTime() < (new Date()).getTime());
  };
  
  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1,
    minDate:minDeadline
  };
  
  $scope.format = 'dd-MMMM-yyyy';
  
  $scope.$watch('deadline', function(value){
    if (value < minDeadline) $scope.deadline = minDeadline;
  });
}

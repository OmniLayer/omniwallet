function CrowdsaleIssuanceController($scope){
  var transactionGenerationController = $scope.$parent;
  $scope.currencyList=[
    { symbol: "BTC", id: 0},
    { symbol: "MSC", id: 1}
  ];
  $scope.propertyTypes = [
    { value: 1, description: "New Indivisible tokens"},
    { value: 2, description: "New Divisible currency"},
    { value: 65,  description: "Indivisible tokens replacing a previous property"},
    { value: 66,  description: "Divisible currency replacing a previous property"},
    { value: 129,  description: "Indivisible tokens appending a previous property"},
    { value: 130, description:  "Divisible currency appending a previous property"}
  ];
  
  $scope.isNewProperty = true;
  
  $scope.checkPropertyType = function(){
    if ($scope.propertyType != 1 && $scope.propertyType != 2)
      $scope.isNewProperty = false;
    else
      $scope.isNewProperty = true;
  };
  
  transactionGenerationController.validateTransactionData = function(){
    var dustValue = 5430;
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

  $scope.clear = function () {
    $scope.deadline = null;
  };
  
  $scope.minDate = new Date((new Date()).getTime() + (1000*60*60*24));
 
  $scope.open = function($event) {
    $event.preventDefault();
    $event.stopPropagation();

    $scope.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  //$scope.formats = [, 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = 'dd-MMMM-yyyy';
}

function PropertyIssuanceController($scope, propertiesService){
  var transactionGenerationController = $scope.$parent;
  $scope.ecosystem = 2;
  $scope.propertyType = 2;
  $scope.categories=[];
  $scope.subcategories=[];
  
   $scope.setEcosystem = function(){
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
  
  $scope.setEcosystem();
  
  transactionGenerationController.validateTransactionData=function(){
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
    propertyUrl=$scope.propertyUrl;
    
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
  
  transactionGenerationController.modalTemplateUrl = '/partials/wallet_assets_issue_modal.html';
  
  transactionGenerationController.setModalScope = function($modalScope){
    $modalScope.issueSuccess = false, $modalScope.issueError = false, $modalScope.waiting = false, $modalScope.privKeyPass = {};
    $modalScope.convertSatoshiToDisplayedValue=  $scope.convertSatoshiToDisplayedValue,
    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
    $modalScope.numberProperties=  $scope.numberProperties,
    $modalScope.propertyTypeName=  $scope.propertyType == 1 || $scope.propertyType == 65 || $scope.propertyType == 129? 'Indivisible' : 'Divisible',
    $modalScope.propertyName= $scope.propertyName,
    $modalScope.propertyCategory= $scope.propertyCategory,
    $modalScope.propertySubcategory= $scope.propertySubcategory,
    $modalScope.propertyUrl= $scope.propertyUrl;
  };
  
  transactionGenerationController.generateData = function(){
    return {
      from:$scope.selectedAddress,
      transactionType: 50,
      transactionData: {
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
        transaction_from: $scope.selectedAddress
      }
    };
  };
}

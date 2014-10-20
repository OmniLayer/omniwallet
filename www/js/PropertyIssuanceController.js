function PropertyIssuanceController($scope, propertiesService, $timeout, $injector, $modal){
  $scope.walletAssets=$scope.$parent.$parent;
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
  $scope.categories=[];
  $scope.subcategories=[];
  $scope.propertyCategory='';
  
  $scope.setEcosystem = function(){
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
  
  $scope.setEcosystem();
  
  $scope.isDivisible=function(){
    return $scope.propertyType == 2 || $scope.propertyType == 66 || $scope.propertyType == 130
  };
  
  $scope.typeChanged = function(){
    $scope.tokenStep = $scope.tokenMin = $scope.isDivisible() ? 0.00000001 : 1;
    $scope.tokenMax = $scope.isDivisible() ? "92233720368.54775807" : "9223372036854775807";
  };
  transactionGenerationController.validateTransactionData=function(){
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
  
  transactionGenerationController.modalTemplateUrl = '/partials/wallet_assets_issue_modal.html';
  
  transactionGenerationController.setModalScope = function($modalScope){
    $modalScope.transactionSuccess = false, $modalScope.transactionError = false, $modalScope.waiting = false, $modalScope.privKeyPass = {};
    $modalScope.convertSatoshiToDisplayedValue=  $scope.convertSatoshiToDisplayedValue,
    $modalScope.getDisplayedAbbreviation=  $scope.getDisplayedAbbreviation,
    $modalScope.numberProperties=  $scope.numberProperties,
    $modalScope.divisible= $scope.isDivisible() ? 'divisible' : 'indivisible',
    $modalScope.propertyName= $scope.propertyName,
    $modalScope.propertyCategory= $scope.propertyCategory,
    $modalScope.propertySubcategory= $scope.propertySubcategory,
    $modalScope.propertyUrl= $scope.propertyUrl;
    $modalScope.propertyData= $scope.propertyData;
    $modalScope.selectedAddress= $scope.selectedAddress;
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
    return {
      from:$scope.selectedAddress,
      transactionType: 50,
      transactionData: {
        transaction_version:0,
        ecosystem:$scope.ecosystem,
        property_type : $scope.propertyType, 
        previous_property_id:$scope.previousPropertyId || 0, 
        property_category:$scope.propertyCategory || '\0', 
        property_subcategory:$scope.propertySubcategory || '\0', 
        property_name:$scope.propertyName, 
        property_url:$scope.propertyUrl || '\0', 
        property_data:$scope.propertyData || '\0', 
        number_properties: $scope.isDivisible() ? +$scope.convertDisplayedValue($scope.numberProperties) : +$scope.numberProperties,
        transaction_from: $scope.selectedAddress,
        fee: $scope.convertDisplayedValue($scope.minerFees)
      }
    };
  };
}

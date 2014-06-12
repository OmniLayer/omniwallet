function PropertyIssuanceController($scope, $http,$modal, userService, walletTransactionService){

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
  
  
  
  $scope.validatePropertyIssuanceForm = function() {
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
      
    if (error.length < 8) {
      $scope.$parent.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        templateUrl: '/partials/wallet_assets_issue_modal.html',
        controller: function($scope, $rootScope, userService, data, preparePropertyIssuanceTransaction, convertSatoshiToDisplayedValue, getDisplayedAbbreviation) {
          $scope.issueSuccess = false, $scope.issueError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.convertSatoshiToDisplayedValue=  convertSatoshiToDisplayedValue,
          $scope.getDisplayedAbbreviation=  getDisplayedAbbreviation,
          $scope.numberProperties=  data.numberProperties,
          $scope.propertyTypeName=  data.propertyTypeName,
          $scope.propertyName= data.propertyName,
          $scope.propertyCategory= data.propertyCategory,
          $scope.propertySubcategory= data.propertySubcategory,
          $scope.propertyUrl= data.propertyUrl;
          
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            preparePropertyIssuanceTransaction(50, {
                transaction_version:0,
                ecosystem:2,
                property_type : data.propertyType, 
                previous_property_id:data.previousPropertyId || 0, 
                property_category:data.propertyCategory, 
                property_subcategory:data.propertySubcategory, 
                property_name:data.propertyName, 
                property_url:data.propertyUrl, 
                property_data:data.propertyData, 
                number_properties:data.numberProperties,
                transaction_from: data.from
              }, data.from, $scope);
          };
        },
        resolve: {
          data: function() {
            return {
              from:$scope.selectedAddress,
              numberProperties:numberProperties,
              propertyType:propertyType,
              propertyTypeName:propertyType == 1 || propertyType == 65 || propertyType == 129? 'Indivisible' : 'Divisible', // Only values 1 or 2 are supported right now, but leave room for expansion.
              previousPropertyId:previousPropertyId,
              propertyName:propertyName,
              propertyCategory:propertyCategory,
              propertySubcategory:propertySubcategory,
              propertyUrl:propertyUrl,
              propertyData:'\0' // this is fixed to 1 byte by the spec
            };
          },
          preparePropertyIssuanceTransaction: function() {
              return $scope.prepareTransaction;
          },
          convertSatoshiToDisplayedValue: function() {
            return $scope.convertSatoshiToDisplayedValue;
          },
          getDisplayedAbbreviation: function() {
            return $scope.getDisplayedAbbreviation;
          }
        }
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.$parent.showErrors = true;
    }
  };
}

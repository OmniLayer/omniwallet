function PropertyIssuanceController($scope, $http){
  $scope.showErrors =false;
  $scope.issueProperty = function(){
    var request = { 
      "transaction_type": $scope.transaction_type,
      "ecosystem": $scope.ecosystem,
      "property_type": $scope.property_type,
      "previous_property_id": $scope.previous_property_id,
      "property_category": $scope.property_category,
      "property_subcategory": $scope.property_subcategory,
      "property_name": $scope.property_name,
      "property_url": $scope.property_url,
      "property_data": $scope.property_data,
      "number_properties": $scope.number_properties,
      "transaction_from": $scope.transaction_from,
      "from_private_key": $scope.from_private_key
    };
    $http({
          url: "/v1/properties/issue",
          method: 'POST',
          data:  request
          })
    .then(function(result){
        
    });
  };
}

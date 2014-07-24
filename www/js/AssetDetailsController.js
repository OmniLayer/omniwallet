function AssetDetailsController($route, $scope, propertiesService, userService){
  $scope.propertyId = $route.current.params.propertyId;
  $scope.property = {
    "name" : "",
    "category" : "",
    "subcategory" : "",
    "data" : "",
    "url" : "",
    "divisible" : true,
    "issuer" : "",
    "creationtxid" : "",
    "fixedissuance" : false,
    "totaltokens" : 0
  };
  
  $scope.crowdsale = {
    "name" : "",
    "active" : true,
    "issuer" : "",
    "propertyiddesired" : null,
    "tokensperunit" : 0,
    "earlybonus" : 0,
    "percenttoissuer" : 0,
    "starttime" : 0,
    "deadline" : 0,
    "amountraised" : 0,
    "tokensissued" : 0
  };
  
  $scope.isOwner = false;
  $scope.acceptedCurrencies = [];
  $scope.formatedCurency = "";
  $scope.formatedStartDate = "";
  $scope.daysAgo = 0;
  $scope.earlyBirdBonus =  0;
  $scope.estimatedWorth = "0";
  $scope.history = {
    total:0,
    transactions:[]
  };
  
  propertiesService.getProperty($scope.propertyId).then(function(result){
    $scope.property = result.data;
    
    if(!$scope.property.fixedissuance)
    {
      propertiesService.getCrowdsale($scope.propertyId).then(function(result){
        $scope.crowdsale = result.data;
        
        $scope.isOwner = userService.loggedIn() && userService.getAddressesWithPrivkey().indexOf($scope.crowdsale.issuer) > -1;
        propertiesService.getProperty($scope.crowdsale.propertyiddesired).then(function(result){
          $scope.acceptedCurrencies = [{name:result.data.name,rate:$scope.crowdsale.tokensperunit}];
          // this value should come from each investment transaction
          $scope.formatedCurency = result.data.name;
        });
        
        var startDate = new Date($scope.crowdsale.starttime*1000);
        $scope.formatedStartDate = startDate.toLocaleDateString();
        
        var now = new Date();
        $scope.daysAgo = Math.round((now.getTime() - startDate.getTime()) / (1000*60*60*24));
        $scope.earlyBirdBonus =  (($scope.crowdsale.deadline - (now.getTime()/1000)) / 604800) * $scope.crowdsale.earlybonus;
        $scope.estimatedWorth = "0";
      });
      
      propertiesService.getCrowdsaleHistory($scope.propertyId,0,5).then(function(result){
        $scope.history = result.data;
      });
    }
  });
  
  
}
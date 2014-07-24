function ExplorerAssetsController($scope, userService, propertiesService){
  $scope.isLoggedIn = userService.loggedIn();
  $scope.ecosystem = 2;
  $scope.crowdsales = [];
  $scope.setEcosystem = function(){
    propertiesService.getActiveCrowdsales($scope.ecosystem).then(function(result){
      $scope.crowdsales=result.data.crowdsales;
    });
  };
  
  $scope.setEcosystem();
  
}

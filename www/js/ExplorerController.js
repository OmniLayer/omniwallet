function ExplorerAssetsController($scope, Account){
  $scope.isLoggedIn = Account.loggedIn;
  $scope.ecosystem = 2;
  $scope.crowdsales = [];
  $scope.setEcosystem = function(){
    propertiesService.getActiveCrowdsales($scope.ecosystem).then(function(result){
      $scope.crowdsales=result.data.crowdsales.sort(function(a, b) {
          var dateA = a.starttime;
          var dateB = b.starttime;
          return (dateA < dateB) ? -1 : (dateA > dateB) ? 1 : (a.name.toUpperCase() < b.name.toUpperCase()) ? -1 : 1;
      });
    });
  };
  
  $scope.setEcosystem();
  
}

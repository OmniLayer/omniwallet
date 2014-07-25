function ExplorerAssetsController($scope, userService){
  $scope.isLoggedIn = userService.loggedIn();
  
  //TODO: Get assets data for display
}

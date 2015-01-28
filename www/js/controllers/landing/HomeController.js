angular.module("omniControllers")
  .controller("HomeController", ["$scope","$templateCache", "$injector", "$location","$http", "$q", "Account", "Address",
    function HomeController($scope, $templateCache, $injector, $location, $http, $q, Account, Address) {
    if (Account.uuid) {
      $location.url('/wallet/overview');
    } else {
      //DEV ONLY
      console.log('cleared cache');
      $templateCache.removeAll();

      $scope.balanceAddress = ""; 
      $scope.checkAddress = null;
      $scope.total = 0;
      $scope.validate = function(address) {
        //console.log('checking '+address);
        return Bitcoin.Address.validate(address);
      };
      $scope.checkBalance = function() {
        $scope.checkAddress = new Address($scope.balanceAddress);
      };
      $scope.openBalanceCheckModal = function(){
        //call modal manager service to display the balance check modal
      }
     };
    }])
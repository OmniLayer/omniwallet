angular.module('omniwallet', ['ngRoute'],
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/wallet', {
      templateUrl: 'wallet.html',
      controller: WalletCtrl
    });
    $routeProvider.when('/trade', {
       templateUrl: 'trade.html',
       controller: TradeCtrl
    });
    $routeProvider.when('/explorer', {
       templateUrl: 'explorer.html',
       controller: ExplorerCtrl
    });
    $routeProvider.when('/about', {
       templateUrl: 'about.html',
       controller: AboutCtrl
    });
    $locationProvider.html5Mode(true).hashPrefix('!');
});

function ExplorerCtrl() {
}
function TradeCtrl() {
}
function WalletCtrl() {
}
function AboutCtrl($scope, $location) {
  console.log($scope.$location.path())
}

function Ctrl($scope, $route, $routeParams, $location) {
  
  $scope.$route = $route
  $scope.$location = $location

  $scope.templates = { 
        'header': 'header.html', 
        'footer': 'footer.html',
  };
}

function NavigationController($scope, $http) {
    $scope.values = {};
    
    $scope.getNavData = function() {
      console.log('init 0');
    }

}

function BTCController($scope, $http) {
    // Scope members
    $scope.transactions = {};
    $scope.currency = 'MSC'
    
    $scope.getData = function getData() {  
      var file =  '/v1/transaction/general/TMSC_0001.json';
      $http.get( file, {}).success(
        function (data, status, headers, config) {
          $scope.transactions = data;
          console.log($scope.transactions);
      });
    }
}


function RevisionController($scope, $http) {
    $scope.revision = {};
    
    $scope.getData = function () {
      console.log('init 2')
    }
}

function SidecarController($scope, $http) {
    $scope.values = {};
    
    $scope.getInit = function() {
      console.log('init 3');
    }
}

angular.module('omniwallet', ['ngRoute'],
  function($routeProvider, $locationProvider) {
    $routeProvider.when('/wallet', {
      templateUrl: 'wallet.html',
      controller: WalletCtrl
    });
    $routeProvider.when('/about', {
       templateUrl: 'about.html',
       controller: AboutCtrl
    });
    $locationProvider.html5Mode(false).hashPrefix('!');
});

function WalletCtrl() {
}
function AboutCtrl() {
}

function Ctrl($scope, $route, $routeParams, $location) {
  
  $scope.$route = $route
  $scope.$location = $location
  console.log($scope.$location.url())
  $scope.templates = { 
        'header': 'header.html', 
        'footer': 'footer.html',
        'middle': 'middle.html', 
        'sidecar': 'sidecar.html'
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
    $scope.caption = '';
    $scope.pages = {};
    $scope.showPages = 5;
    $scope.currentPageStart = 1;
    $scope.currentPage = 1;
    $scope.numberOfPages = 12; // this we will get somehow from the server
    $scope.firstLoad = true;
    $scope.prevClass='disabled';
    $scope.nextClass='';
    
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


function SimpleSendController($scope, userService) {
  var wallet = userService.getWallet();

  MySimpleSendHelpers(wallet);

}
function HomeCtrl($templateCache) {
  //DEV ONLY
  $templateCache.removeAll()
}

function Ctrl($scope, $route, $routeParams, $location) {
  
  $scope.$route = $route
  $scope.$location = $location
     
  $scope.templates = { 
        'header': 'header.html', 
        'footer': 'footer.html',
        'sidecar': '/partials/sidecar.html'
  };

}

function NavigationController($scope, $http, userService) {
    $scope.values = {};
    
    $scope.getNavData = function() {
      console.log('init 0');
    }
    console.log(userService);
     
    $scope.user = userService.data;
}

function ExplorerController($scope, $http) {
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

function SidecarController($scope, $http) {
    $scope.values = {};
    $scope.setView = function(viewName) {
        $scope.view = $scope.sidecarTemplates[viewName]
    };
    $scope.getView = function() {
       return $scope.view;
    }
    $scope.sidecarTemplates = {
          'explorer':'/partials/explorer_sc.html',
          'about': '/partials/about_sc.html',
          'trade': '/partials/trade_sc.html',
          'wallet': '/partials/wallet_sc.html'
    };

}

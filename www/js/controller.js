
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
    $scope.currencies = ['MSC','TMSC']
    
    $scope.getData = function getData(currency) {  
      $http.get('/v1/transaction/values.json', {}). success(
        function(data) {
          for(var i = 0; i < data.length; i++) {
            if(currency == data[i].currency) {
              var file =  '/v1/transaction/general/' + currency + '_0001.json';
              $http.get( file, {}).success(
                function (data, status, headers, config) {
                  $scope.transactions = data;
              });
            }
          }
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

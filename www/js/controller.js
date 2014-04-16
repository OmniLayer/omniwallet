
function SimpleSendController($scope, userService) {
  var wallet = userService.getWallet();

  MySimpleSendHelpers(wallet);

}
function HomeCtrl( $templateCache, $injector, $location ) {
  if(  $injector.get( 'userService' ).getUUID() )
  {
    $location.url( '/wallet/overview' );
  }
  else
  {
    //DEV ONLY
    console.log('cleared cache')
    $templateCache.removeAll()
  }
}
function StatsCtrl($scope, $route, $routeParams, $http){
  $http.get('/v1/system/stats.json', {}).success(function(data) {
    $scope.stats = data
  })
}
function Ctrl($scope, $route, $routeParams, $location) {
  
  $scope.$route = $route
  $scope.$location = $location
     
  $scope.templates = { 
        'header': '/header.html', 
        'footer': '/footer.html',
        'sidecar': '/partials/sidecar.html',
        'add_address': '/partials/add_address.html',
        'disclaimer': '/partials/disclaimer.html'
  };

}


function HiddenLoginController($scope, $modal, $location) {
  $scope.open = function () {
     $scope.uuid = $location.path().replace("/login/", "");

    $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function () {
          return $scope.uuid;
        }
      }
    });
  }
}

function NavigationController($scope, $http, $modal, userService) {
    
    $scope.getNavData = function() {
      console.log('init 0');
    }

    $scope.openCreateModal = function() {
      $modal.open({
        templateUrl: '/partials/wallet_create_modal.html',
        controller: CreateWalletController
      });
    }

    $scope.openImportModal = function() {
      $modal.open({
        templateUrl: '/partials/wallet_import_modal.html',
        controller: WalletController
      });
    }

    $scope.openLoginModal = function() {
      $modal.open({
        templateUrl: '/partials/login_modal.html',
        controller: LoginController 
      });
    }

    $scope.logout = function() {
      userService.logout();
    }
     
    $scope.user = userService.data;
}

function ExplorerController($scope, $http, hashExplorer) {
    $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
    // Scope members
    $scope.searchQueryText = '';
    $scope.transactions = [];
    $scope.currencies = ['MSC','TMSC']
    $scope.currency = 'MSC'

    $scope.getData = function getData(){ 
      var currency = $scope.currency; console.log('did', currency)
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

    $scope.searchQuery = function(trans) { 
      return ($scope.searchQueryText === '' || trans.tx_hash.indexOf($scope.searchQueryText) >= 0 || trans.from_address.indexOf($scope.searchQueryText) >= 0 || trans.to_address.indexOf($scope.searchQueryText) >= 0);
    };
}
function ExplorerInspectorController($scope, hashExplorer) {
  $scope.transactionData = JSON.parse(hashExplorer.tx)
  $scope.tx_keys = Object.keys($scope.transactionData);
  $scope.fieldlist = $scope.tx_keys
  $scope.pastLoc = hashExplorer.loc

}
function SidecarController($scope, $http, userService) {
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
          'wallet': '/partials/wallet_sc.html'
    };
  
    $scope.hasAddresses = userService.data.loggedIn && userService.getAllAddresses().length != 0 ? true : false;
    $scope.hasAddressesWithPrivkey = userService.data.loggedIn && getAddressesWithPrivkey().length != 0 ? true : false;
  
    function getAddressesWithPrivkey() {
      var addresses = []
      userService.getAllAddresses().map(
        function(e,i,a) { 
          if(e.privkey && e.privkey.length == 58) {
            addresses.push(e.address);
          }
        }
      );
      return addresses
    }

}

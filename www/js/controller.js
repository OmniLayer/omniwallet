
function SimpleSendController($scope, userService) {
  var wallet = userService.getWallet();

  MySimpleSendHelpers(wallet);

}
function HomeCtrl($scope, $templateCache, $injector, $location, $http, $q) {
  if ($injector.get('userService').getUUID()) {
    $location.url('/wallet/overview');
  } else {
    //DEV ONLY
    console.log('cleared cache');
    $templateCache.removeAll();

    $scope.balanceAddress = "";
    $scope.hasBalances = false;
    $scope.total = 0;
    $scope.checkBalance = function() {
      var balances = {};
      var appraiser = $injector.get('appraiser');
      $injector.get('balanceService').balance($scope.balanceAddress).then(function(result) {
        result.data.balance.forEach(function(currencyItem) {
          balances[currencyItem.symbol] = {
            "symbol": currencyItem.symbol,
            "balance": parseInt(currencyItem.value),
            "value": appraiser.getValue(currencyItem.value, currencyItem.symbol),
          };
          if (currencyItem.symbol == 'BTC') {
            balances[currencyItem.symbol].name = "Bitcoin";
          }
        });
        $http.get('/v1/transaction/values.json').then(function(result) {
          currencyInfo = result.data;

          currencyInfo.forEach(function(item) {
            if (balances.hasOwnProperty(item.currency))
              balances[item.currency].name = item.name;
          });

          // Now, any applicable smart properties.
          var spReqs = [];

          for (var b in balances) {
            var spMatch = balances[b].symbol.match(/^SP([0-9]+)$/);

            if (spMatch != null) {
              var updateFunction = function(result) {
                if (result.status == 200) {
                  this.property_type = result.data[0].formatted_property_type;
                  this.name = result.data[0].propertyName + ' (' + this.symbol.match(/^SP([0-9]+)$/)[1] + ')';
                }
              };
              spReqs.push($http.get('/v1/property/' + spMatch[1] + '.json').then(updateFunction.bind(balances[b])));
            }
          }

          if (spReqs.length > 0) {
            $q.all(spReqs).then(function() {
              $scope.balances = balances;
              $scope.hasBalances = true;
            });
          } else {
            $scope.balances = balances;
            $scope.hasBalances = true;
          }

        }
        );

      });
    };

  }
}
function StatsCtrl($scope, $route, $routeParams, $http) {

  $http.get('/v1/system/stats.json', {}).success(function(data) {
    $scope.stats = data;
  });
}

function Ctrl($scope, $route, $routeParams, $modal, $location, browser) {

  $scope.$route = $route;
  $scope.$location = $location;
  $scope.browser = browser;

  /*$scope.$on('$locationChangeStart', function(event, next) {
    if (browser === 'chrome') {
      return;
    }

    event.preventDefault();

    $modal.open({
      backdrop: 'static',
      templateUrl: '/partials/browser_message_modal.html'
    });
  });*/

  $scope.templates = {
    'header': '/header.html',
    'footer': '/footer.html',
    'sidecar': '/partials/sidecar.html',
    'add_address': '/partials/add_address.html',
    'disclaimer': '/partials/disclaimer.html'
  };

}

function HiddenLoginController($scope, $modal, $location) {
  $scope.open = function() {
    $scope.uuid = $location.path().replace("/login/", "");

    $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function() {
          return $scope.uuid;
        }
      }
    });
  }
}

function RevisionController($scope, $http, $modal, userService) {

  $scope.getData = function() {
    console.log('init 0');
    $http.get('/v1/system/revision.json', {}).success(function(data) {
      $scope.rev = data;
    });
  };
}

function NavigationController($scope, $http, $modal, userService) {

  $scope.getNavData = function() {
    console.log('init 0');
  };

  $scope.openCreateModal = function() {
    $modal.open({
      templateUrl: '/partials/wallet_create_modal.html',
      controller: CreateWalletController
    });
  };

  $scope.openImportModal = function() {
    $modal.open({
      templateUrl: '/partials/wallet_import_modal.html',
      controller: WalletController
    });
  };

  $scope.openLoginModal = function() {
    $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginController
    });
  };

  $scope.logout = function() {
    window.location.reload(false);
  };

  $scope.user = userService.data;
}

function ExplorerController($scope, $http, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
  // Scope members
  $scope.searchQueryText = '';
  $scope.transactions = [];
  $scope.currencies = ['MSC', 'TMSC'];
  $scope.currency = 'MSC';

  $scope.getData = function getData() {
    var currency = $scope.currency;
    console.log('did', currency);
    $http.get('/v1/transaction/values.json', {}). success(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (currency == data[i].currency) {
          var file = '/v1/transaction/general/' + currency + '_0001.json';
          $http.get(file, {}).success(function(data, status, headers, config) {
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
function ExplorerInspectorController($scope, $location, $http, hashExplorer) {
  function setData() {
    $scope.transactionData = JSON.parse(hashExplorer.tx);
    $scope.tx_keys = Object.keys($scope.transactionData);
    $scope.fieldlist = $scope.tx_keys;
    $scope.pastLoc = hashExplorer.loc;
  }

  if (hashExplorer.tx) {
    setData();
  } else {
    $http.get('/v1/transaction/tx/' + $location.search()['view'] + '.json'). success(function(data) {
      hashExplorer.setHash(data[0]);
      setData();
    });
  }
}
function SidecarController($scope, $http, userService) {
  $scope.values = {};
  $scope.setView = function(viewName) {
    $scope.view = $scope.sidecarTemplates[viewName];
  };
  $scope.getView = function() {
    return $scope.view;
  };
  $scope.sidecarTemplates = {
    'explorer': '/partials/explorer_sc.html',
    'about': '/partials/about_sc.html',
    'wallet': '/partials/wallet_sc.html'
  };

  $scope.hasAddresses = userService.data.loggedIn && userService.getAllAddresses().length != 0 ? true : false;
  $scope.hasAddressesWithPrivkey = userService.data.loggedIn && getAddressesWithPrivkey().length != 0 ? true : false;

  $scope.$watch(function() {
    return userService.getAllAddresses()
  }, function(result) {
    $scope.hasAddresses = userService.data.loggedIn && result.length != 0 ? true : false;
    $scope.hasAddressesWithPrivkey = userService.data.loggedIn && getAddressesWithPrivkey().length != 0 ? true : false;
  }, true);

  function getAddressesWithPrivkey() {
    var addresses = []
    userService.getAllAddresses().map(function(e, i, a) {
      if (e.privkey && e.privkey.length == 58) {
        addresses.push(e.address);
      }
    }
    );
    return addresses;
  }

}


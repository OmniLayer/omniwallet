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

function ExplorerAssetsController($scope, userService){
  $scope.isLoggedIn = userService.loggedIn();
  
  //TODO: Get assets data for display
}

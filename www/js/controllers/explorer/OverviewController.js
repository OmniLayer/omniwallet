angular.module("omniControllers")
  .controller("ExplorerOverviewController",["$scope", "$http", "hashExplorer",
    function ExplorerController($scope, $http, hashExplorer) {
      $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
      // Scope members
      $scope.searchQueryText = '';
      $scope.searchRan = false;
      $scope.searchQueryReturned=false;
      $scope.transactions = [];
      $scope.currencies = ['MSC', 'TMSC'];
      $scope.currency = 'MSC';

      $scope.getData = function getData() {
        var currency = $scope.currency;
        $http.get('/v1/transaction/values.json', {}). success(function(data) {
          for (var i = 0; i < data.length; i++) {
            if (currency == data[i].currency) {
              var file = '/v1/transaction/general/' + currency + '_0001.json';
              $http.get(file, {}).success(function(data, status, headers, config) {

                angular.forEach(data, function(transaction, index) {

                  data[index].utc_time = new Date(+transaction.tx_time).toUTCString().replace('GMT','');
                  //DEBUG console.log(new Date(Number(transaction.tx_time)))
                  data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'
                });

                $scope.transactions = data;
                $scope.searchQueryText = '';
                $scope.searchRan = false;
                $scope.searchQueryReturned=false;
              });
            }
          }
        });
      }
      $scope.doSearch = function() {
        if( $scope.searchQueryText == undefined || $scope.searchQueryText == '' || $scope.searchQueryText.length < 4 )
          return -1;
        $scope.searchRan=true;
        $scope.searchQueryReturned=false;
        var file = '/v1/search/';
        $http.get('/v1/search/?query=' + $scope.searchQueryText, {}).success(function(successData, status, headers, config) {
          angular.forEach(successData.data, function(transaction, index) {
            //DEBUG console.log(transaction)
            successData.data[index].utc_time = new Date(+transaction.tx_time).toUTCString().replace('GMT','');
            successData.data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'
          });

          //Sort by date
          successData.data = successData.data.sort(function(a, b) {
            return b.tx_time - a.tx_time;
          });

          if ($scope.searchQueryText == "")
            $scope.searchQueryText = hashExplorer.search

          $scope.transactions = successData.data;
          $scope.searchQueryReturned=true;
          $scope.searchQueryReturnedText=[ successData.data.length, $scope.searchQueryText.slice(0,7) + ( $scope.searchQueryText.length > 7 ? '...' : '' ) ];
          hashExplorer.setSearch( $scope.searchQueryText );
        });
      };
      $scope.searchQuery = function(trans) {
        return ($scope.searchQueryText === '' || trans.tx_hash.indexOf($scope.searchQueryText) >= 0 || trans.from_address.indexOf($scope.searchQueryText) >= 0 || trans.to_address.indexOf($scope.searchQueryText) >= 0);
      };        

      //set up state
      if (hashExplorer.tx != '') {
        $scope.searchQueryText = hashExplorer.search;
        $scope.doSearch();
      }
    }])
angular.module("omniControllers")
  .controller("ExplorerOverviewController",["$scope", "$http", "hashExplorer",
    function ExplorerController($scope, $http, hashExplorer) {
      $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
      // Scope members
      $scope.searchQueryText = '';
      $scope.transactions = [];
      $scope.currency = 'OMNI';

      $scope.clear = function clear(){
        $scope.searchQueryText = '';
        if($scope.noResults)
          $scope.noResults = false;
        else
          $scope.getData();
      }

      $scope.getData = function getData() {
        var currency = $scope.currency;
        $http.get('/v1/transaction/general/', {}).success(function(data, status, headers, config) {
          angular.forEach(data, function(transaction, index) {
            data[index].utc_time = new Date(+transaction.tx_time).toUTCString().replace('GMT','');
            //DEBUG console.log(new Date(Number(transaction.tx_time)))
            data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...';
            data[index].from_address_concat = transaction.from_address.substring(0, 7) + '...' + transaction.from_address.substring(transaction.from_address.length-7);
            data[index].to_address_concat = transaction.to_address.substring(0, 7) + '...' + transaction.to_address.substring(transaction.to_address.length-7);
          });
          $scope.transactions = data;
        });
      }

      $scope.doSearch = function() {
        if( $scope.searchQueryText == undefined || $scope.searchQueryText == '' || $scope.searchQueryText.length < 64 )
          return -1;
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

          $scope.noResults =  successData.data.length==0;
          if($scope.noResults){
            $scope.getData();
          }else{
            $scope.transactions = successData.data;
          }
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

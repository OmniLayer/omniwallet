angular.module("omniControllers")
	.controller("ExplorerInspectorController",["$scope", "$location", "$http", "hashExplorer",
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
		}])
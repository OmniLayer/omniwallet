angular.module('omniControllers')
	.controller('WalletHistoryController', ["$scope", "$q", "$http", "hashExplorer", "Wallet", 
		function WalletHistoryController($scope, $q, $http, hashExplorer, Wallet) {
		  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
		  //$scope.selectedAddress = Wallet.addresses[0].address;
		  $scope.addresses = Wallet.addresses;

		  $scope.getAllData = function getAllData() {
		    var transaction_data = [];
		    var promises = [];
		    $scope.isLoading = "True";


		    angular.forEach($scope.addresses, function(addrObject) {
		      promises.push($http.post('/v1/transaction/address', {
		        'addr': addrObject.hash
		      })
		      .success(function(data, status, headers, config) {
		        delete data.address;
		        delete data.balance;

		        var keys = Object.keys(data);

		        angular.forEach(keys, function(tx_type) {
		          tx_data = data[ tx_type ];
		          angular.forEach( data[ tx_type ], function( tx_a, idx ) {
		            if (tx_a instanceof Array && tx_a.length != 0) {
		              //DEBUG console.log(tx_type, msc_tx);
		              transaction_data = transaction_data.concat(tx_a);
		            }
		          });
		        });
		      })
		      );
		    });

		    $q.all(promises).then(function() {
		      transaction_data = transaction_data.sort(function(a, b) {
		        return b.tx_time - a.tx_time;
		      });

		      angular.forEach(transaction_data, function(transaction, index) {
		        //DEBUG console.log(new Date(Number(transaction.tx_time)))
		        transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'

		        if(transaction.currency_str == 'Smart Property' && transaction.propertyName != undefined) 
		          transaction.currency_str = transaction.propertyName;
		        if(transaction.currency_str == undefined)
		          transaction.currency_str = transaction.icon_text;
		        if(transaction.tx_type_str == undefined)
		          transaction.tx_type_str = transaction.icon_text;

		        var addresses = $scope.addresses.map(function(addrO) { return addrO.hash; });
		        var incoming = addresses.indexOf(transaction.to_address);

		        if(incoming == -1 && transaction.to_address.length > 32)
		          transaction.color = 'info';
		        if(incoming != -1 && transaction.to_address.length > 32)
		          transaction.color = 'success';
		        if(transaction.to_address.length < 32)
		          transaction.color = 'warning';

		        //DEBUG console.log(incoming, 'inc', transaction.to_address, 'hash', transaction.tx_hash, 'color', transaction.color)
		      });

		      var hashes = [];
		      var clone = transaction_data.slice(0);
		      transaction_data.forEach(function(tx,idx) { 
		        var foundHash = hashes.indexOf( tx.tx_hash );

		        if( foundHash === -1 ) { 
		          hashes.push(tx.tx_hash);
		        } 
		        else {
		          //console.log('found dup', tx.tx_hash, idx);
		          delete transaction_data[idx];
		        }
		      });

		      $scope.history = transaction_data;
		      $scope.isLoading = "False";
		    });
		  }

		  $scope.getData = function getData(address) {

		    if (!address) {
		      $scope.getAllData();
		      return;
		    }
		    $scope.isLoading = "True";

		    console.log('Addr request 4');
		    $http.post('/v1/transaction/address', {
		        'addr': address
		      })
		      .success(function(data, status, headers, config) {

		      $scope.address = data.address;

		      delete data.address;
		      delete data.balance;

		      var transaction_data = [];
		      var keys = Object.keys(data);

		      angular.forEach(keys, function(tx_type) {
		        tx_data = data[ tx_type ];
		        angular.forEach( data[ tx_type ], function( tx_a, idx ) {
		          if (tx_a instanceof Array && tx_a.length != 0) {
		            //DEBUG console.log(tx_type, msc_tx);
		            transaction_data = transaction_data.concat(tx_a);
		          }
		        });
		      });

		      //sort by date, ascending
		      transaction_data = transaction_data.sort(function(a, b) {
		        return b.tx_time - a.tx_time;
		      });

		      angular.forEach(transaction_data, function(transaction, index) {
		        //DEBUG console.log(new Date(Number(transaction.tx_time)))
		        transaction_data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'

		        if(transaction.currency_str == 'Smart Property' && transaction.propertyName != undefined) 
		          transaction.currency_str = transaction.propertyName;
		        if(transaction.currency_str == undefined)
		          transaction.currency_str = transaction.icon_text;
		        if(transaction.tx_type_str == undefined)
		          transaction.tx_type_str = transaction.icon_text;

		        var addresses = $scope.addresses.map(function(addrO) { return addrO.hash; });
		        var incoming = addresses.indexOf(transaction.to_address);

		        if(incoming == -1 && transaction.to_address.length > 32)
		          transaction.color = 'info';
		        if(incoming != -1 && transaction.to_address.length > 32)
		          transaction.color = 'success';
		        if(transaction.to_address.length < 32)
		          transaction.color = 'warning';

		        //DEBUG console.log(incoming, 'inc', transaction.to_address, 'hash', transaction.tx_hash, 'color', transaction.color)
		      });

		      var hashes = [];
		      var clone = transaction_data.slice(0);
		      transaction_data.forEach(function(tx,idx) { 
		        var foundHash = hashes.indexOf( tx.tx_hash );

		        if( foundHash === -1 ) { 
		          hashes.push(tx.tx_hash);
		        } 
		        else {
		          //console.log('found dup', tx.tx_hash, idx);
		          delete transaction_data[idx];
		        }
		      });

		      $scope.history = transaction_data;
		      $scope.isLoading = "False";
		    });
		  }
		}])
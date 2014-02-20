
function WalletController() {
  console.log('initialized wallet')
}

function WalletHistoryController($scope, $http) {
  console.log('initialized wallet history')
  $scope.getData = function getData(address) {
    var file = '/v1/address/addr/' + address + '.json'; 
    $http.get( file, {} ).success(
      function(data, status, headers, config) {

        $scope.address = data.address;

        delete data.address;
        delete data.balance;
        
        var transaction_data = []
        angular.forEach(data[0], function(msc_tx, tx_type ) {
          if( msc_tx instanceof Array && msc_tx.length != 0 ) {
            console.log(tx_type, msc_tx);
            transaction_data = transaction_data.concat(msc_tx);
          }
        });
        
        angular.forEach(data[1], function(tmsc_tx, tx_type) {
          if( tmsc_tx instanceof Array && tmsc_tx.length != 0 ) {
            console.log(tx_type, tmsc_tx);
            transaction_data = transaction_data.concat(tmsc_tx);
          }
        });

        //sort by date, ascending
        transaction_data = transaction_data.sort(function(a,b) {
            return b.tx_time - a.tx_time;
        });
        
        //DEBUG angular.forEach(transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        //DEBUG });

        $scope.history = transaction_data;
      });
  }
}

function WalletSendController($scope) {
  console.log('initialized wallet')

  $scope.currList = ['MSC', 'TMSC', 'BTC']
  $scope.addrList = ['1Sochi', '1Enjoy', '1Balding']
  $scope.fakeData = ['23200','232113$USD']
}

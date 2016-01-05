angular.module("omniControllers")
  .controller("HomeController", ["$scope","$templateCache", "$injector", "$location","$http", "$q", "Account", "Address", 
    function HomeController($scope, $templateCache, $injector, $location, $http, $q, Account, Address) {
    if (Account.uuid) {
      $location.url('/wallet/overview');
    } else {
      //DEV ONLY
      console.log('cleared cache');
      $templateCache.removeAll();

      $scope.conversions = {};
      $scope.balanceAddress = ""; 
      $scope.checkAddress = null;
      $scope.total = 0;
      $scope.validate = function(address) {
        //console.log('checking '+address);
        return Bitcoin.Address.validate(address);
      };
      $scope.checkBalance = function() {
        $scope.checkAddress = new Address($scope.balanceAddress);
      };
      $scope.openBalanceCheckModal = function(){
        //call modal manager service to display the balance check modal
      }

      $scope.getValue = function(amount, symbol, divisible) {
        if (symbol == 'BTC') {
          if ($scope.conversions.BTC)
            return $scope.conversions.BTC * amount;
          else
            return 0;
        } else {        
          if ($scope.conversions.hasOwnProperty(symbol)) {
            if (divisible)
              return $scope.getValue($scope.conversions[symbol] * amount, 'BTC', true);
            else
              return $scope.getValue($scope.conversions[symbol] * amount * 100000000, 'BTC', true);
          } else
            return 0;
        }
      };

      $scope.$on("address:loaded",function(evt,args){
        var requests = [];
        var coins = $scope.checkAddress.balance;
        cursym = "USD";
        coins.forEach(function(coin) {
          var symbol = "";
          if (coin.symbol === 'BTC') {
            symbol="BTC"+cursym;
          } else {
            symbol=coin.symbol;
          }
          requests.push(
          $http.get('/v1/values/' + symbol + '.json').then(function(response) {
            var currency = response.data[0];
            if (currency.symbol == 'BTC') {
              // Store these things internally as the value of a satoshi.
              $scope.conversions.BTC = currency.price / 100000000;
            } else {
              $scope.conversions[currency.symbol] = currency.price;
            }
            coin.balance = $scope.getValue(coin.value,coin.symbol,coin.divisible)
            coin.price = $scope.getValue(coin.divisible ? 100000000 : 1,coin.symbol,coin.divisible)
          }, function(error) {
            console.log(error);
          })
          );
        });
        $q.all(requests).then(function(responses) {
          $scope.pricesLoaded = true;
        });
      })
     };
    }])
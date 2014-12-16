angular.module("omniControllers")
  .controller("HomeController", ["$scope","$templateCache", "$injector", "$location","$http", "$q", "Account",
    function HomeController($scope, $templateCache, $injector, $location, $http, $q, Account) {
    if (Account.uuid) {
      $location.url('/wallet/overview');
    } else {
      //DEV ONLY
      console.log('cleared cache');
      $templateCache.removeAll();

      $scope.balanceAddress = "";
      $scope.hasBalances = false;
      $scope.total = 0;
      $scope.validate = function(address) {
        //console.log('checking '+address);
        return Bitcoin.Address.validate(address);
      };
      $scope.checkBalance = function() {
        var balances = {};
        var appraiser = $injector.get('appraiser');
        $injector.get('balanceService').balance($scope.balanceAddress).then(function(result) {
          result.data.balance.forEach(function(currencyItem, index, collection) {
            if(currencyItem.divisible)
              var value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();

            appraiser.updateValue(function() {
              balances[currencyItem.symbol] = {
                "symbol": currencyItem.symbol,
                "balance": +value || currencyItem.value,
                "value": appraiser.getValue(currencyItem.value, currencyItem.symbol, currencyItem.divisible),
              };
              if (currencyItem.symbol == 'BTC') {
                balances[currencyItem.symbol].name = "Bitcoin";
              }

              if (Object.keys(balances).length < collection.length)
                return;
            
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
              });
            }, currencyItem.symbol);
          });
        });
      };
     };
    }])
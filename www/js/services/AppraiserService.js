angular.module('omniServices').service('appraiser', ['$rootScope', '$http', '$q', 'Wallet','Account', 'BalanceSocket',
 function($rootScope, $http, $q, Wallet, Account, BalanceSocket) {
    var self = this;
    self.conversions = {};

    function UpdateLoop() {
      self.updateValues(function() {
        setTimeout(UpdateLoop, 300000);
      });
    }

    BalanceSocket.on("valuebook", function(data){
      if (typeof data!="undefined") {
        processValueBook(data);
      }
    });

    var processValueBook = function (valuebook) {
      var coins = Wallet.assets;
      var changed = [];
      coins.forEach(function(coin) {
        if (coin.symbol === 'BTC') {
          symbol="BTC"+cursym;
        } else {
          symbol=coin.symbol;
        }
        currency=valuebook[symbol];
        if (typeof currency != "undefined") {
          if (currency.symbol == 'BTC') {
            // Store these things internally as the value of a satoshi.
            self.conversions.BTC = currency.price / 100000000;
          } else {
            self.conversions[currency.symbol] = currency.price;
          }
          value = self.getValue(coin.balance,coin.symbol,coin.divisible)
          price = self.getValue(coin.divisible ? Big(100000000) : Big(1),coin.symbol,coin.divisible)
          if (coin.value != value || coin.price != price) {
            coin.value=value;
            coin.price=price;
            changed.push(currency.symbol);
          }
        }
      });
      if (changed.length>0) {
        $rootScope.$broadcast('APPRAISER_VALUE_CHANGED',changed)
      }
    };

    self.updateValues = function(callback) {
      var requests = [];
      var coins = Wallet.assets;
      cursym = Account.getSetting("usercurrency");
      var changed = [];
      coins.forEach(function(coin) {
        if (coin.symbol === 'BTC') {
          symbol="BTC"+cursym;
        } else {
          symbol=coin.symbol;
        }
        requests.push(
          $http.get('/v1/values/' + symbol + '.json').then(function(response) {
            var currency = response.data;
            if (currency.symbol == 'BTC') {
              // Store these things internally as the value of a satoshi.
              self.conversions.BTC = currency.price / 100000000;
            } else {
              self.conversions[currency.symbol] = currency.price;
            }
            coin.value = self.getValue(coin.balance,coin.symbol,coin.divisible)
            coin.price = self.getValue(coin.divisible ? Big(100000000) : Big(1),coin.symbol,coin.divisible)
            changed.push(currency.symbol)
          }, function(error) {
            console.log(error);
          })
        );
      });
      $q.all(requests).then(function(responses) {
        if (changed.length>0)
          $rootScope.$broadcast('APPRAISER_VALUE_CHANGED',changed)
        
        if(callback)
          callback();
      });
    };

    self.updateValue = function(callback, symbol) {      
      if (symbol === 'BTC') {
        usercur=symbol+cursym;
      } else {
        usercur=symbol
      }
      if (symbol === 'BTC' || self.conversions.BTC) {
        $http.get('/v1/values/' + usercur + '.json').then(function(response) {
          var currency = response.data;
          if (currency.symbol == 'BTC') {
            // Store these things internally as the value of a satoshi.
            self.conversions.BTC = currency.price / 100000000;
          } else if (currency.symbol) {
            self.conversions[currency.symbol] = currency.price;
          }
          callback();
        }, function(error) {
          console.log(error);

          self.conversions[symbol] = 0;
          callback();
        });
      }
      else {
	self.updateValue(function() {
          self.updateValue(callback, symbol);
	}, 'BTC');
      }
    };

    self.getValue = function(amount, symbol, divisible) {
      if (symbol == 'BTC') {
        if (self.conversions.BTC)
          return amount.times(self.conversions.BTC).valueOf();
        else
          return 0;
      } else {        
        if (self.conversions.hasOwnProperty(symbol)) {
          if (divisible)
            return self.getValue(amount.times(self.conversions[symbol]), 'BTC', true);
          else
            return self.getValue(amount.times(100000000).times(self.conversions[symbol]), 'BTC', true);
        } else
          return 0;
      }
    };

    self.start = function(){
    //  UpdateLoop();
    }

    cursym = "USD";
  }]);

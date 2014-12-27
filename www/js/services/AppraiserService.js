angular.module('omniServices').service('appraiser', ['$rootScope', '$http', '$q', 'Wallet','Account',
 function($rootScope, $http, $q, Wallet, Account) {
    var self = this;
    self.conversions = {};

    function UpdateLoop() {
      self.updateValues(function() {
        setTimeout(UpdateLoop, 300000);
      });
    }

  
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
          var currency = response.data[0];
          if (currency.symbol == 'BTC') {
            // Store these things internally as the value of a satoshi.
            self.conversions.BTC = currency.price / 100000000;
          } else {
            self.conversions[currency.symbol] = currency.price;
          }
          coin.price = self.getValue(coin.balance,coin.symbol,coin.divisible)
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
          var currency = response.data[0];
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
          return self.conversions.BTC * amount;
        else
          return '--';
      } else {        
        if (self.conversions.hasOwnProperty(symbol)) {
          if (divisible)
            return self.getValue(self.conversions[symbol] * amount, 'BTC', true);
          else
            return self.getValue(self.conversions[symbol] * amount * 100000000, 'BTC', true);
        } else
          return '--';
      }
    };

    self.start = function(){
      UpdateLoop();
    }

    cursym = "USD";
  }]);
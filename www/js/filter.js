angular.module('omniwallet')
  .filter('cryptocurrency', [function() {
      return function(item) {
        return formatCurrencyInFundamentalUnit(item.balance, item.symbol);
      };
    }
  ])
  .filter('truncate', [function () {
      return function (text, length, end) {
        if (isNaN(length))
            length = 10;

        if (end === undefined)
            end = "...";

        if (text === undefined || text.length <= length || text.length - end.length <= length) {
            return text;
        }
        else {
            return String(text).substring(0, length-end.length) + end;
        }
      };
   }])
   .filter('crowdsaleDeadline', [function() {
      return function(seconds) {
        var deadline = new Date(seconds *1000);
        var deadlineUTC = new Date(deadline.getTime() + deadline.getTimezoneOffset() * 60000);
        return deadlineUTC.toLocaleString();
      };
    }
  ]).filter('crowdsaleStatus', [function() {
      return function(active) {
        return active ? "Active" : "Finished";
      };
    }
  ]).filter('assetIssuedType', [function() {
      return function(fixedissuance) {
        return fixedissuance ? "Property" : "Crowdsale";
      };
    }
  ]);

var conversionFactor = {
  'mtos': 0.00001000, //millibit to satoshi
  'utos': 0.00000100, //microbit to satoshi
  'wtos': 0.00000001, //whole to satoshi

  'stou': 1000000, //microbit
  'stow': 100000000, //satoshi
  'stom': 100000, //satoshi to millibit
  //These are original values and are not consistent
  'BTC': 100000,
  'OMNI': 100000000,
  'T-OMNI': 100000000,

  'mtow': 1000,
  'wtom': 0.001,
  'wtow': 1
};
function getConversionFactor(symbol) {
  return conversionFactor[symbol];
}
function formatCurrencyInFundamentalUnit(balance, symbol) {
  if (balance instanceof Array) {
    balance.forEach(function(e, i, a) {
      a[i] = e / conversionFactor[symbol];
    });
    return balance;
  } else if (conversionFactor[symbol]) {
    return (balance / conversionFactor[symbol]);
  } else {
    return balance / conversionFactor.stow;
  }
}
function convertToFundamentalUnit(value, symbol) {
  if (typeof value != 'number')
    return;

  return Math.round(value * conversionFactor[symbol]);
}

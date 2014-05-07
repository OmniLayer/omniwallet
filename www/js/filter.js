angular.module( 'omniwallet' )
  .filter( 'cryptocurrency', [
    function() {
      return function( item ) {
        return formatCurrencyInFundamentalUnit( item.balance, item.symbol );
      }
    }
] );
var conversionFactor = {
  'mtos': 0.00001000, //millibit to satoshi
  'utos': 0.00000100, //microbit to satoshi
  'wtos': 0.00000001, //whole to satoshi

  'stou': 1000000, //microbit
  'stow': 100000000, //satoshi
  'stom': 100000, //satoshi to millibit
  //These are original values and are not consistent
  'BTC':  100000,
  'MSC':  100000000,
  'TMSC': 100000000,

  'mtow': 1000,
  'wtom': 0.001,
  'wtow': 1
};
function getConversionFactor( symbol ) {
  return conversionFactor[ symbol ];
}
function formatCurrencyInFundamentalUnit( balance, symbol) {
    if(balance instanceof Array) {
      balance.forEach(function(e,i,a) { a[i] = e / conversionFactor[symbol]; });
      return balance;
    } 
    else if( conversionFactor[ symbol ])
    {
      return ( balance / conversionFactor[ symbol ] ) ;
    }
    else
    {
      return balance / conversionFactor.stow;
    }
}
function convertToFundamentalUnit( value, symbol ) {
  if( typeof value != 'number' )
    return;

    return Math.round( value * conversionFactor[ symbol ] );
}

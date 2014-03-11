angular.module( 'omniwallet' )
  .filter( 'cryptocurrency', [
    function() {
      return function( item ) {
        return formatCurrencyInFundamentalUnit( item.balance, item.symbol );
      }
    }
] );
var conversionFactor = {
  'BTC': 100000,
  'MSC': 100000000,
  'TMSC': 100000000
};
function getConversionFactor( symbol ) {
  return conversionFactor[ symbol ];
}
function formatCurrencyInFundamentalUnit( balance, symbol ) {
  if( symbol == 'BTC' )
    return ( balance / conversionFactor.BTC ) + ' mBTC';
  else if( symbol == 'MSC' || symbol == 'TMSC' )
    return ( balance / conversionFactor[ symbol ] ) + ' ' + symbol;
  else
    return balance + ' ' + symbol;
}
function convertToFundamentalUnit( value, symbol ) {
  if( typeof value != 'number' )
    return;

    return Math.round( value * conversionFactor[ symbol ] );
}

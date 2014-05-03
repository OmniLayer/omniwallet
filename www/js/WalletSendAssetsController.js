function WalletSendAssetsController($modal, $scope, $http, $q, userService) {
 // [ Form Validation]

  $scope.showErrors = false;

  // [ Template Initialization ]

  $scope.currencyList = userService.getCurrencies(); // [{symbol: 'BTC', addresses:[], name: 'BTC'}, {symbol: 'MSC', addresses:[], name: 'MSC'}, {symbol: 'TMSC', addresses:[], name: 'TMSC'}]
  $scope.selectedCoin = $scope.currencyList[0].symbol;

  // Attach a listener for when the selected
    $scope.$watch( 'selectedCoin', function( newValue, oldValue ) {

    });

  function convertSatoshiToDisplayedValue( satoshi ) {
    if( $scope.selectedCoin == 'BTC' )
      return satoshi / 100000.0;
    else if( $scope.selectedCoin.indexOf( 'SP' ) == 0 )
    {
      for( var i in $scope.currencyList )
      {
        if( $scope.currencyList[i].symbol == $scope.selectedCoin )
        {
          if( $scope.currencyList[ i ].property_type == 1 )
            return satoshi;
          else
            return satoshi / 100000000.0;
        }
      }
      return satoshi / 100000000.0;
    }
    else
    {
      return satoshi / 100000000.0;
    }
  }

  $scope.convertSatoshiToDisplayedValue = convertSatoshiToDisplayedValue;

  function getDisplayedAbbreviation()
  {
    if( $scope.selectedCoin == 'BTC' )
      return 'mBTC';
    else if( $scope.selectedCoin.indexOf( 'SP' ) == 0 )
    {
      for( var i in $scope.currencyList )
      {
        if( $scope.currencyList[i].symbol == $scope.selectedCoin )
          return $scope.currencyList[i].name + ' #' + $scope.selectedCoin.match( /SP([0-9]+)/ )[1];
      }

      return 'Smart Property #' + $scope.selectedCoin.match( /SP([0-9]+)/ )[1];
    }
    else
      return $scope.selectedCoin;
  }
  $scope.getDisplayedAbbreviation = getDisplayedAbbreviation;

  function convertDisplayedValueToSatoshi( value ) {
    if( $scope.selectedCoin == 'BTC' )
    {
      return Math.ceil( value * 100000 );
    }
    else if( $scope.selectedCoin.indexOf( 'SP' ) == 0 )
    {
      for( var i in $scope.currencyList )
      {
        if( $scope.currencyList[i].symbol == $scope.selectedCoin )
        {
          if( $scope.currencyList[ i ].property_type == 1 )
            return Math.ceil( value );
          else
            return Math.ceil( value * 100000000 );
        }
      }
      return Math.ceil( value * 100000000 );
    }
    else
    {
      return Math.ceil( value * 100000000 );
    }
  }

  $scope.addressList = getAddressesWithPrivkey();
  $scope.selectedAddress = $scope.addressList[0];
  $scope.minerFees = formatCurrencyInFundamentalUnit(0.0001, 'wtom');

  function getAddressesWithPrivkey() {
    var addresses = [];
    userService.getAllAddresses().map(
      function(e,i,a) {
        if(e.privkey && e.privkey.length == 58) {
          addresses.push(e.address);
        }
      }
    );
    if( addresses.length == 0)
      addresses = ['Could not find any addresses with attached private keys!'];
    return addresses;
  }

  // [ Retrieve Balances ]
  $scope.balanceData = [ 0 ];
  var addrListBal = [];

  $scope.setBalance = function() {
    $scope.balanceData = [ 0 ];
    var coin = $scope.selectedCoin;
    var address = $scope.selectedAddress;
    if (address || coin) {
      for(var i = 0; i < addrListBal.length; i++) {
        if( addrListBal[i] && addrListBal[i].address == address) {
          for(var k = 0; k < addrListBal[i].balance.length; k++) {
            if(addrListBal[i].balance[k].symbol == coin) {
              $scope.balanceData[0] = addrListBal[i].balance[k].value;
              //console.log($scope.address, coin, $scope.balanceData, addrListBal[i].balance[k], k);
            }
            if(addrListBal[i].balance[k].symbol == 'BTC') {
              $scope.balanceData[1] = addrListBal[i].balance[k].value;
            }
          }
        }
      }
    }
  };

  $scope.addressList.forEach(function(e,i) {
     var promise = getAddressData(e);
     promise.then(function(successData) {
        var successData = successData.data;
        addrListBal[i] = { address: e, balance: successData.balance };
        $scope.setBalance();
     },function(errorData) {
       alert("We have encountered a problem accessing the server ... Please try again in a few minutes")
       //console.log('Error, no balance data found for ' + e + ' setting defaults...');
       var balances = [ 
          { symbol: 'MSC', value: '0' },
          { symbol: 'TMSC', value: '0' },
          { symbol: 'BTC', value: '0' } ];
       addrListBal[i] = { address: e, balance: balances };
     });
  });

  // [ Helper Functions ]

  function validAddress(addr) {
    try{
      var checkValid = new Bitcoin.Address(addr);
      return true;
    } catch(e) {
      return false;
    }
  }

  function getAddressData(address) {
    console.log( 'Addr request 5' );
    var promise = $http.post( '/v1/address/addr/', { 'addr': address });

    return promise;
  }

  function pushSignedTransaction(signedTransaction) {
    var url = '/v1/transaction/pushtx/';
    var data = { signedTransaction: signedTransaction };
    var promise = $http.post( url, data );
    return promise;
  }


  // [ Send Form Helpers ]

  function getUnsignedSendTransaction(toAddress, pubKey, fromAddress, amount, currency, fee) {
    var url = '/v1/transaction/send/';
    var data = { 
      from_address: fromAddress, 
      to_address: toAddress, 
      amount: amount, 
      currency: currency, 
      fee: fee,
      marker: $scope.marked,
      pubKey: pubKey
    };
    var promise = $http.post( url, data );
    
    return promise;
  }

  function prepareSendTransaction(to, from, amt, currency, fee, privkeyphrase, $modalScope) {
    var addressData = userService.getAddress(from);
    var privKey = new Bitcoin.ECKey.decodeEncryptedFormat(addressData.privkey, addressData.address); // Using address as temporary password
    var pubKey = privKey.getPubKeyHex();

    $scope.sendTxPromise = getUnsignedSendTransaction(to, pubKey, from, amt, currency, fee);
    $scope.sendTxPromise.then(function(successData) {

      if( successData.data.error )
      {
        $modalScope.waiting = false;
        $modalScope.sendError = true;
        $modalScope.error = 'Error preparing send transaction: ' + successData.data.error;
      }
      else
      {
        var successData = successData.data;
        var sourceScript = successData.sourceScript;
        var unsignedTransaction = successData.transaction;

        try {
          var bytes = Bitcoin.Util.hexToBytes(unsignedTransaction);
          var transaction = Bitcoin.Transaction.deserialize(bytes);
          var script = parseScript(successData.sourceScript);

          transaction.ins.forEach( function( input ) {
            input.script = script;
          } );

          //DEBUG console.log('before',transaction, Bitcoin.Util.bytesToHex(transaction.serialize()));
          var signedSuccess = transaction.signWithKey(privKey);

          var finalTransaction = Bitcoin.Util.bytesToHex(transaction.serialize());

          //Showing the user the transaction hash doesn't work right now
          //var transactionHash = Bitcoin.Util.bytesToHex(transaction.getHash().reverse());

          pushSignedTransaction(finalTransaction).then(function(successData) {
            var successData = successData.data;
            if( successData.pushed.match(/submitted|success/gi) != null ) {
              $modalScope.waiting = false;
              $modalScope.sendSuccess = true;
              $modalScope.url = 'http://blockchain.info/address/' + from + '?sort=0';
            } else {
              $modalScope.waiting = false;
              $modalScope.sendError = true;
              $modalScope.error = successData.pushed;  //Unspecified error, show user
            }
          },function(errorData) {
            $modalScope.waiting = false;
            $modalScope.sendError = true;
            if( errorData.message )
              $modalScope.error = 'Server error: ' + errorData.message;
            else if( errorData.data )
                $modalScope.error = 'Server error: ' + errorData.data;
            else
              $modalScope.error = 'Unknown Server Error';
              console.error( errorData );
          });

          //DEBUG console.log(addressData, privKey, bytes, transaction, script, signedSuccess, finalTransaction );
          function parseScript (script) {
                var newScript = new Bitcoin.Script();
                var s = script.split(" ");
                for (var i = 0; i < s.length; i++) {
                    if (Bitcoin.Opcode.map.hasOwnProperty(s[i])) {
                        newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
                    } else {
                        newScript.writeBytes(Bitcoin.Util.hexToBytes(s[i]));
                    }
                }
                return newScript;
         }
        } catch(e) {
          $modalScope.sendError = true;
          if( e.message )
            $modalScope.error = 'Error sending transaction: ' + e.message;
          else if( e.data )
            $modalScope.error = 'Error sending transaction: ' + e.data;
          else
            $modalScope.error = 'Unknown error sending transaction';
          console.error( e );          
        }
      }
    },function(errorData) {
      $modalScope.sendError = true;
      if( errorData.message )
        $modalScope.error = 'Server error: ' + errorData.message;
      else if( errorData.data )
          $modalScope.error = 'Server error: ' + errorData.data;
      else
        $modalScope.error = 'Unknown Server Error';
      console.error( errorData );
    });
  }

  $scope.validateSendForm = function() {
    var dustValue = 5430; 
    var minerMinimum = 10000; 
    var nonZeroValue = 1; 

    var minerFees = Math.ceil( $scope.minerFees * 100000 );
    var sendAmount = convertDisplayedValueToSatoshi( $scope.sendAmount );

    var balance = +$scope.balanceData[0];
    var btcbalance = +$scope.balanceData[1];
    
    var coin = $scope.selectedCoin;
    var address = $scope.selectedAddress;
    var sendTo = $scope.sendTo
    var required = [coin,address,sendAmount,sendTo, minerFees,balance, btcbalance, $scope.sendForm.$valid ];

    var error = 'Please ';
    if( $scope.sendForm.$valid == false) {
        error += 'make sure all fields are completely filled, ';
    }
    if( ( sendAmount <= balance ) == false ) {
        error += 'make sure you aren\'t sending more coins than you own, ';
    }
    if( ( minerFees <= btcbalance ) ==  false ) {
        error += 'make sure you have enough Bitcoin to cover your fees, ';
    }
    if( validAddress(sendTo) == false) {
       error += 'make sure you are sending to a valid MSC/BTC address, ';
    }
    if(coin == 'BTC') {
       if( sendAmount < dustValue )
        error += 'make sure your send amount is at least 0.05430 mBTC if sending BTC, ';
       if( minerFees < minerMinimum )
        error += 'make sure your fee entry is at least 0.1 mBTC to cover miner costs, ';
    }
    if( ( (coin == 'MSC') || (coin == 'TMSC') ) ) {
       if( sendAmount < nonZeroValue )
        error += 'make sure your send amount is non-zero, ';
       if( minerFees < minerMinimum )
        error += 'make sure your fee entry is at least 0.1 mBTC, ';
    }
    if( error.length < 8) {
      $scope.showErrors = false;
      // open modal
      var modalInstance = $modal.open({
        template: '\
          <div class="modal-body">\
              <h3 class="text-center"> Confirm send </h3>\
              <h3>You\'re about to send ' + convertSatoshiToDisplayedValue( sendAmount ) + ' ' + getDisplayedAbbreviation() + 
              ' plus ' + $scope.minerFees + ' mBTC in fees to ' + $scope.sendTo + '</h3>\
            <p><br>\
            If the above is correct, please press Send Funds.\
            If you encounter an error, feel free to click away from the dialog and try again.\
            </p>\
          <div class="modal-footer">\
              <div class="row">\
              <button ng-disabled="clicked" class="btn btn-primary" ng-click="ok()">Yes, send my funds</button>\
              <img class="" src="/assets/img/34-1.gif" ng-show="waiting">\
              </div>\
                <br>\
              <div class="row">\
                <div ng-show="sendSuccess">\
                  <h4 class="pull-right col-xs-12" style="color:green"> Funds were sent successfully, \
                  check your transaction <a target="_blank" href="{{url}}">here.</a></h4>\
                </div>\
                <div ng-show="sendError">\
                  <h4 class="col-xs-12" style="color:red;"> Funds could not be sent: \
                   {{error}} </h4>\
                </div>\
              </div>\
          </div>\
        ',
        controller: function($scope,$rootScope, userService,data, prepareSendTransaction, getUnsignedSendTransaction){
          $scope.sendSuccess = false, $scope.sendError = false, $scope.waiting = false, $scope.privKeyPass = {};
          $scope.ok = function() {
            $scope.clicked = true;
            $scope.waiting = true;
            prepareSendTransaction(data.sendTo, data.sendFrom, data.amt, data.coin, data.fee, $scope.privKeyPass, $scope);
          }
        },
        resolve: {
          data:function(){ 
            return {  
              sendTo: sendTo, 
              sendFrom: address, 
              amt: sendAmount,
              coin: coin, 
              fee: minerFees } 
          },
          prepareSendTransaction: function() { 
            return prepareSendTransaction; 
          },
          getUnsignedSendTransaction: function() {
            return getUnsignedSendTransaction; 
          },
          pushSignedTransaction: function() {
            return pushSignedTransaction;
          }
        }
      });
    } else {
      error += 'and try again.';
      $scope.error = error;
      $scope.showErrors = true;
    }
  };
}


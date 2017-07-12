angular.module('omniServices')
  .service('TransactionGenerator',['$http',"TESTNET","SATOSHI_UNIT",function TransactionGeneratorService($http, TESTNET, SATOSHI_UNIT){
    var self = this;
      self.pushSignedTransaction = function(signedTransaction) {
        var url = '/v1/transaction/pushtx/';
        var data = {
          signedTransaction: signedTransaction
        };
        var promise = $http.post(url, data);
        return promise;
      };
      
      self.getUnsignedTransaction = function(type, data){
        if (type == 0 && data.currency_identifier == 0){ // BTC send
          data = {
            'from_address':data.pubkey,
            'to_address':data.transaction_to,
            'amount':new Big(data.amount_to_transfer).times(SATOSHI_UNIT).valueOf(),
            'currency':'BTC',
            'fee':data.fee,
            'marker': (data.marker || false),
            'testnet': (TESTNET || false)
          };
          var url = '/v1/transaction/send/';
        // } else if (type == 20) { // sell tx
        //   var url = '/v1/exchange/sell/';
        //   data["seller"] = data["transaction_from"]
        //   data["pubKey"] = data["pubkey"]
        // }else if (type==22){ // accept tx
        //   var url = '/v1/exchange/accept/';
        //   data["buyer"] = data["transaction_from"]
        //   data["pubKey"] = data["pubkey"]
        }else{ // SP and simple send tx
          var url = '/v1/transaction/getunsigned/'+type;
        } 
        var promise = $http.post(url, data);
        return promise;
      },

      self.getArmoryUnsigned = function(unsignedHex,pubKey){
        var url = '/v1/armory/getunsigned';
        var data = {
          'unsigned_hex': unsignedHex,
          'pubkey': pubKey
        };
        var promise = $http.post(url, data);
        return promise;
      },
      
      self.getArmoryRaw = function(signedHex){
        var url = '/v1/armory/getrawtransaction';
        var data = {
          'signed_hex': signedHex
        };
        var promise = $http.post(url, data);
        return promise;
      }
    }]);

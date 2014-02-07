var initialAmount = 0;
function APITestController($scope, $http) {
    $scope.transactionInformation;
 
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";
    
    var ctype = "tmsc";
    function getAddress() {
       return $('.btcaddress').val();
    }
    
    function makeRequestAddress(offer, valid, accept, sale) {
      //     SELL OFFER OPTIONS     |  ACCEPT OFFER OPTIONS
      // TMSC or MSC                                       
      // SELL, ACCEPT or BOTH                                    
      var postData = { 
        type: 'ADDRESS',
        address: getAddress(), 
        currencyType: ctype,   
        offerType: offer,      
        validityStatus: valid, 
        acceptsStatus: accept, 
        salesStatus: sale      
      };
      var div = $('.dataSection')
      console.log("POST DATA: ", postData);
      $.post('/api/offers/', postData , function(data,status,headers,config) {
         div.text(JSON.stringify(data, null, '\t'));
         console.log(data);
      });
    }

    function getTransactionBid() {
       return $('.bidhash').val();
    }

    function makeRequestTransactionBid(valid, accept, sale) {
      // VALID, INVALID, CANCEL, EXPIRED or ANY                    
      var postData = { 
        type: 'TRANSACTIONBID',
        transaction: getTransactionBid(), 
        currencyType: ctype,   
        validityStatus: valid, 
        acceptsStatus: accept, 
        salesStatus: sale      
      };
      var div = $('.dataSection2');
      console.log("POST DATA: ", postData);
      $.post('/api/offers/', postData , function(data,status,headers,config) {
         div.text(JSON.stringify(data, null, '\t'));
         console.log(data);
      });
    }

    function getTransaction() {
       return $('.hash').val();
    }

    function makeRequestTransaction(valid, accept, sale) {
      // VALID, INVALID, CANCEL, EXPIRED or ANY                    
      // [NONE, SOME, CLOSED, or ANY], [N/A]               
      // [ SOME, CLOSED, or ANY], [WAITING, PAID, N/A]
      var postData = { 
        type: 'TRANSACTION',
        transaction: getTransaction(), 
        currencyType: ctype   
      };
      var div = $('.dataSection3');
      console.log("POST DATA: ", postData);
      $.post('/api/offers/', postData , function(data,status,headers,config) {
         div.text(JSON.stringify(data,null, '\t'));
         console.log(data);
      });
    }
    
    // Show sell and accept based on BTC address

    $scope.ShowSellAndPaidOffers = function() {
      makeRequestAddress('SELL');
    };                         
    $scope.ShowAcceptAndBoughtOffers = function() {
      makeRequestAddress('ACCEPT');
    };                                     

    //Raw Bids based on transaction

    $scope.SellingExpired = function() {
      makeRequestTransactionBid('EXPIRED');
    };
    $scope.SellingInvalid = function() {
      makeRequestTransactionBid('INVALID');
    };
    $scope.SellingValid = function() {
      makeRequestTransactionBid('VALID');
    };                      
    $scope.SellingAny = function() {
      makeRequestTransactionBid('ANY');
    };                            

    //raw transaction

    $scope.GetTransaction = function() {
      makeRequestTransaction();
    };                            
}

$(document).ready(function myfunction() {

    
});



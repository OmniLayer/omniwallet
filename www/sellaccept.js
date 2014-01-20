function SellacceptController($scope, $http, $q) {
    $scope.transactionInformation;
    $scope.sell_offer_tx;
    $scope.btc_payment;
    $scope.offers;
    $scope.reason = "unknown";

    $scope.footer = "FOOTER";
    $scope.title = "TITLE";

    $scope.createIconPopup = function () {
            $('.iconPopupInit').popover({ trigger: "hover" });           
    };
    
    //Function for creating popup
    $scope.makePopup = function () {
        //Popup for valid/invalid 
        $('#validPopup').popover({ trigger: "hover" });
        var navHeight = $('.navbar').height();
        $('.page-container').css('paddingTop', navHeight + 20);
    };
    
    $scope.getSellacceptData = function () {

        // parse tx from url parameters
        var myURLParams = BTCUtils.getQueryStringArgs();
        var file = 'tx/' + myURLParams['tx'] + '.json';
        console.log(file);
        // Make the http request and process the result

        $scope.tInformation = $http.get(file, {cache: false});
	        
	$q.all([$scope.tInformation]).then(function(values) {
	    $scope.transactionInformation = values[0].data[0];
	    $scope.updateReason();
	    
	    var txfile = 'tx/' + values[0].data[0].sell_offer_txid + '.json';
	    $scope.tInformation2 = $http.get(txfile, {cache: false});
	    $q.all([$scope.tInformation2]).then(function(values) {
	    	    $scope.sell_offer_tx = values[0].data[0];
            });
            
            var btcpayfile = 'tx/' + values[0].data[0].tx_hash + '.json';
            $scope.tInformation3 = $http.get(btcpayfile, {cache: false});
	    $q.all([$scope.tInformation3]).then(function(values) {
		    $scope.btc_payment = values[0].data[0];
            });
        });

    };
    
    $scope.updateReason = function () {
	if (!angular.isArray($scope.transactionInformation.invalid)) return;
	if ($scope.transactionInformation.invalid.length < 2) return;
	$scope.reason = $scope.transactionInformation.invalid[1];
    }
}

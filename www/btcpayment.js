function BtcPaymentController($scope, $http) {
    $scope.transactionInformation;
    $scope.fees;

    $scope.footer = "FOOTER";
    $scope.title = "TITLE";
    
    $scope.createIconPopup = function () {
    	$('.iconPopupInit').popover({ trigger: "hover" });           
    };

    $scope.getBtcPaymentData = function () {

        // parse tx from url parameters
        var myURLParams = BTCUtils.getQueryStringArgs();
        var file = 'tx/' + myURLParams['tx'] + '.json';
        console.log(file);
        // Make the http request and process the result

        $http.get(file, {}).success(function (data, status, headers, config) {
            var toAddressArray = [];
            var toAddr = data[0].to_address;
            var arr1 = toAddr.split(";");
            var length = arr1.length;
            for (var i = 0; i < length ; i++) {
                var p = arr1[i].split(":");

                toAddressArray[i] = { "address": p[0], "value": p[1] };
            }

            console.log(toAddressArray);
            data[0].to_address = toAddressArray;
            $scope.transactionInformation = data[0];
            $scope.setDefaults();
            console.log(data);
        });

    }
    
    $scope.setDefaults = function() {
	if (!$scope.transactionInformation.icon_text) {
		$scope.transactionInformation.icon_text = "Bitcoin payment";
	}
	if (!$scope.transactionInformation.color) {
	$scope.transactionInformation.color = "bgc-default";
	}
    }
}

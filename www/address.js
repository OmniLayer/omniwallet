function AdressController($scope, $http) {
    $scope.addressInformation = {};
    $scope.theAddress = "";
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";
    
    $scope.createIconPopup = function () {
        $('.iconPopupInit').popover({ trigger: "hover" });           
    };

    $scope.paymentsReceivedSum = function (currencyId) {
        var length = $scope.addressInformation.received_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.received_transactions[i].currency_id == currencyId) {
                sum += parseFloat($scope.addressInformation.received_transactions[i].amount);
            }
        }
        return sum;
    }

    $scope.boughtViaExodusSum = function (currencyId) {

        var length = $scope.addressInformation.exodus_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.exodus_transactions[i].currency_id == currencyId) {
                sum += parseFloat($scope.addressInformation.exodus_transactions[i].amount);
            }

        }
        return sum;
    }
    //paymentsSentSum
    $scope.paymentsSentSum = function (currencyId) {
        var length = $scope.addressInformation.sent_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.sent_transactions[i].currency_id == currencyId) {
                sum += parseFloat($scope.addressInformation.sent_transactions[i].amount);
            }
        }
        return sum;
    }

    //Count of the transactions
    $scope.incomingTransCount = function (currencyId) {
        var length = $scope.addressInformation.received_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.received_transactions[i].currency_id == currencyId) {
                sum++;
            }

        }
        return sum;
    }

    $scope.outgoingTransCount = function (currencyId) {
        var length = $scope.addressInformation.sent_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.sent_transactions[i].currency_id == currencyId) {
                sum++;
            }

        }
        return sum;
    }

    $scope.exodusTransCount = function (currencyId) {
        var length = $scope.addressInformation.exodus_transactions.length;
        var sum = 0;
        for (var i = 0; i < length; i++) {
            if ($scope.addressInformation.exodus_transactions[i].currency_id == currencyId) {
                sum++;
            }

        }
        return sum;
    }

    $scope.getAddressData = function () {

        // parse addr from url parameters
	var myURLParams = BTCUtils.getQueryStringArgs();
	$scope.theAddress = myURLParams['addr'];
	$('#qrcode').qrcode({
		width: 130,
		height: 130,
		text: myURLParams['addr']
		});
	var file = 'addr/' + myURLParams['addr'] + '.json';	
	var currencyName = myURLParams['currency'];
        if (currencyName == 'MSC') {
           currencyNumber = 0;
        }	
        if (currencyName == 'TMSC') {
           currencyNumber = 1;
        }	
        // Make the http request and process the result
        $http.get(file, {}).success(function (data, status, headers, config) {
            $scope.addressInformation = data[currencyNumber];
        });
    }

    $scope.SendClick = function () {
        var myURLParams = BTCUtils.getQueryStringArgs();
        var url = "sendform.html?addr=";
        url += myURLParams['addr'];
        url += "&currency=";
        url += myURLParams['currency'];
        window.location = url;
    }
    
    $scope.AddToWalletClick = function () {
        var myURLParams = BTCUtils.getQueryStringArgs();
        var addr = myURLParams['addr'];
        Wallet.AddAddress(addr);
    }
}

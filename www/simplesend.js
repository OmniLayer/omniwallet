function TransactionController($scope, $http) {
    $scope.transactionInformation;
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";
    $scope.reason = "unknown";

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
    
    $scope.getTransactionData = function () {

        // parse tx from url parameters
        var myURLParams = BTCUtils.getQueryStringArgs();
        var file = 'tx/' + myURLParams['tx'] + '.json';
        // Make the http request and process the result
        $http.get(file, {}).success(function (data, status, headers, config) {
            $scope.transactionInformation = data[0];
            $scope.setDefaults();
            $scope.updateReason();
        });
    }
    
    $scope.setDefaults = function() {
    	if (!$scope.transactionInformation.icon) {
    		$scope.transactionInformation.icon = "simplesend";
    	}
    	if (!$scope.transactionInformation.color) {
	    	$scope.transactionInformation.color = "bgc-default";
    	}
    }
    
    $scope.updateReason = function () {
    	if (!angular.isArray($scope.transactionInformation.invalid)) return;
    	if ($scope.transactionInformation.invalid.length < 2) return;
    	$scope.reason = $scope.transactionInformation.invalid[1];
    }
}

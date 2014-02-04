function TransactionController($scope, $http) {
    $scope.transactionInformation;
    $scope.offers;

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
        });

        var offersURL = "offers/offers-";
        offersURL += myURLParams['tx'];
        offersURL += ".json";

          $.get(offersURL, {}).success(function (data) {
              //data = $.parseJSON(data);
              $scope.offers = data;
              $scope.$apply();
          });
      
    }

    $scope.AcceptClick = function () {
        var myURLParams = BTCUtils.getQueryStringArgs();
        var url = "acceptform.html?tx=";
        url += myURLParams['tx'];
        window.location = url;
    }
}

function SellofferController($scope, $http) {
    $scope.transactionInformation;
    $scope.bids;

    $scope.footer = "FOOTER";
    $scope.title = "TITLE";

    $scope.createIconPopup = function () {
        $('.iconPopupInit').popover({ trigger: "hover" });           
    };

    $scope.getSellofferData = function () {

        // parse tx from url parameters
        var myURLParams = BTCUtils.getQueryStringArgs();
        var file = 'tx/' + myURLParams['tx'] + '.json';
        // Make the http request and process the result

        $http.get(file, {}).success(function (data, status, headers, config) {
            $scope.transactionInformation = data[0];
        });

        var bidsURL = "bids/bids-";
        bidsURL += myURLParams['tx'];
        bidsURL += ".json";

          $.get(bidsURL, {}).success(function (data) {
              //data = $.parseJSON(data);
              $scope.bids = data;
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

function AssetDetailsController($route, $scope, propertiesService, userService){
  $scope.propertyId = $route.current.params.propertyId;
  $scope.property = {
    "name" : "OmpaLoompa",
    "category" : "Testing",
    "subcategory" : "Crowdsale Demo",
    "data" : "This awesome crowdsale supports multiple currencies!",
    "url" : "http://www.themulticurrencycrowdsale.com",
    "divisible" : true,
    "issuer" : "18eVnuXEixXuVt248a5i18eLnkKbfmpUWk",
    "creationtxid" : "b7c66175a99ca0e7b1691905d50a46165adb7a8012d9ec5e1ecf8239f859df6d",
    "fixedissuance" : false,
    "totaltokens" : 79.42773456
  };
  
  $scope.crowdsale = {
    "name" : "OmpaLoompa",
    "active" : true,
    "issuer" : "18eVnuXEixXuVt248a5i18eLnkKbfmpUWk",
    "propertyiddesired" : 2,
    "tokensperunit" : 0.00000100,
    "earlybonus" : 25,
    "percenttoissuer" : 10,
    "starttime" : 1403303662,
    "deadline" : 2245314240,
    "amountraised" : 7.78038774,
    "tokensissued" : 79.42773456
  };
  
  $scope.isOwner = userService.getAddressesWithPrivkey().indexOf($scope.crowdsale.issuer) > -1;
  
  $scope.acceptedCurrencies = [{name:"Test Mastercoin",rate:$scope.crowdsale.tokensperunit}];
  $scope.formatedCurency = "Test Mastercoin";
  var startDate = new Date($scope.crowdsale.starttime*1000);
  $scope.formatedStartDate = startDate.toLocaleDateString();
  
  var now = new Date();
  $scope.daysAgo = Math.round((now.getTime() - startDate.getTime()) / (1000*60*60*24));
  $scope.earlyBirdBonus =  (($scope.crowdsale.deadline - (now.getTime()/1000)) / 604800) * $scope.crowdsale.earlybonus;
  $scope.tokensForIssuer = 7.36543;
  $scope.estimatedWorth = "49.675";
  
  $scope.history = {
    total:2,
    transactions:[
        {
            "txid" : "333d8fd459b270fde95736846eb81b2547837476f33e8e0b4c1158906870155f",
            "amountsent" : 7.39038774,
            "participanttokens" : 68.58757932,
            "issuertokens" : 6.85875793
        },
        {
            "txid" : "809e63ea2fc5670177a75b1b8eb9b81de933340808daed438d056d71e7b68d7d",
            "amountsent" : 0.39000000,
            "participanttokens" : 3.61945210,
            "issuertokens" : 0.36194521
        }
    ]
  };
  
}
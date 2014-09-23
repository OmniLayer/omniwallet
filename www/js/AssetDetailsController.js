function AssetDetailsController($location, $route, $scope, $timeout, $element, $compile, propertiesService, userService){
  // $scope initialization
  $scope.propertyId = $route.current.params.propertyId;
  $scope.shareUrl = $location.absUrl();
  $scope.property = {
    "name" : "",
    "category" : "",
    "subcategory" : "",
    "data" : "",
    "url" : "",
    "divisible" : true,
    "issuer" : "",
    "creationtxid" : "",
    "fixedissuance" : true,
    "totaltokens" : 0
  };
  
  $scope.crowdsale = {
    "name" : "",
    "active" : true,
    "issuer" : "",
    "propertyiddesired" : null,
    "tokensperunit" : 0,
    "earlybonus" : 0,
    "percenttoissuer" : 0,
    "starttime" : 0,
    "deadline" : 0,
    "amountraised" : 0,
    "tokensissued" : 0
  };
  
  $scope.isOwner = false;
  $scope.acceptedCurrencies = [];
  $scope.formatedStartDate = "";
  $scope.daysAgo = 0;
  $scope.earlyBirdBonus =  0;
  $scope.estimatedWorth = "0";
  $scope.history = {
    total:0,
    transactions:[],
    loading:false,
    loaded:false
  };
  $scope.infoMessage = userService.loggedIn() ? "You don't have the desired currency" : "Login to participate";
  $scope.canParticipate = false;
  $scope.loggedIn = userService.loggedIn();
  
  $scope.pendingThinking = true;
  $scope.hasAddressesWithPrivkey = false;
  $scope.selectedAddress = "";
  $scope.selectedCoin = {name:"-- Loading coins --"};   
  $scope.tokenStep = $scope.tokenMin =  0.00000001;
  $scope.tokenMax = "92233720368.54775807"; 
  
  $scope.participate = function(){
    $scope.pendingThinking = false;
  };
  
  $scope.goBack = function(){
    $scope.pendingThinking = true;
  };
  // Parsing and format functions
  $scope.formatTransactionTime = function(blocktime, format){
    format = format || "locale";
    var time = new Date(blocktime * 1000);
    if (format == "elapsed") {
      var now = new Date();
      var off = (now.getTime() / 1000) - blocktime;
      if (off < 60)
        return "Just now";
      else if (off < 3600)
        return Math.round(off / 60) + " minutes ago";
      else if (off < 86400)
        return Math.round(off / 3600) + " hours ago";
      else if (off < 604800)
        return Math.round(off / 86400) + " days ago";
      else if (off < 2592000)
        return Math.round(off / 604800) + " weeks ago";
      else if (off < 31536000)
        return Math.round(off / 2592000) + " months ago";
      else
        return Math.round(off / 31536000) + " years ago";
      
    } else {
      return time.toLocaleString();
    }
  };
  
  $scope.formatCurrencyName = function (propertyid) {
    var name = "Unknown";
    $scope.acceptedCurrencies.forEach(function(currency){
      if(currency.propertyid == propertyid)
        name =  currency.name;
    });
    
    return name;
  };
  
  $scope.formatTransactionUrl = function (txid) {
    return "http://blockchain.info/tx/"+txid;
  };
  
  // Load property data into the page
  $scope.loadHistory = function(){
    if ($scope.history.loading || $scope.history.loaded) return;
    $scope.history.loading=true;
    
    propertiesService.getHistory($scope.propertyId,$scope.history.transactions.length,5).then(function(result){
      $scope.history.total =  result.data.total;
      for (var i = 0; i < result.data.transactions.length; i++) {
        $scope.history.transactions.push(result.data.transactions[i]);
      }
      $scope.history.loading=false;
      if($scope.history.transactions.length == $scope.history.total)
        $scope.history.loaded = true;
    });
  };
  
  // Load and initialize the form
  propertiesService.getProperty($scope.propertyId).then(function(result){
    $scope.property = result.data;
    
    $scope.crowdsale = result.data;
    // format data
    $scope.crowdsale.participanttokens = new Big($scope.crowdsale.tokensissued);
    var totalTokens = new Big($scope.crowdsale.totaltokens);
    $scope.crowdsale.issuertokens = totalTokens.minus($scope.crowdsale.participanttokens);
    
    $scope.isOwner = userService.loggedIn() && userService.getAddressesWithPrivkey().indexOf($scope.crowdsale.issuer) > -1;
    propertiesService.getProperty($scope.crowdsale.propertyiddesired).then(function(result){
      $scope.acceptedCurrencies = [{propertyid:$scope.crowdsale.propertyiddesired,name:result.data.name,rate:$scope.crowdsale.tokensperunit}];
    });
    
    var startDate = new Date($scope.crowdsale.starttime*1000);
    $scope.formatedStartDate = startDate.toLocaleDateString();
    
    var now = new Date();
    $scope.daysAgo = Math.round((now.getTime() - startDate.getTime()) / (1000*60*60*24));
    $scope.earlyBirdBonus =  ((($scope.crowdsale.deadline - (now.getTime()/1000)) / 604800) * $scope.crowdsale.earlybonus).toFixed(1);
    $scope.estimatedWorth = "0";
    
    // Participate form data
    $scope.sendTo = $scope.crowdsale.issuer;
    userService.getCurrencies().filter(function(currency){
         return currency.tradable;
    }).forEach(function(coin){
      if(coin.id==$scope.crowdsale.propertyiddesired){
        $scope.selectedCoin = coin;    
        $scope.canParticipate = userService.loggedIn();
        $scope.infoMessage = userService.loggedIn() ? "Get some tokens!" : "Login to participate";
        $scope.tokenStep = $scope.tokenMin = coin.divisible ? 0.00000001 : 1;
        $scope.tokenMax = coin.divisible ? "92233720368.54775807" : "9223372036854775807";
      }
    });
    // we need to compile the timer dinamically to get the appropiate end-date set.
    var endtime = $scope.crowdsale.deadline * 1000;
    $timeout(function (){
      var timerNode = $('<timer end-time='+endtime+'> \
        <span class="countdown-group"> \
          <span class="countdown-number">{{days}}</span> \
          <div class="countdown-label">day{{daysS}}</div> \
        </span> \
        : \
        <span class="countdown-group"> \
          <span class="countdown-number">{{hours}}</span> \
          <div class="countdown-label">hour{{hoursS}}</div> \
        </span> \
        : \
        <span class="countdown-group"> \
          <span class="countdown-number">{{minutes}}</span> \
          <div class="countdown-label">minute{{minutesS}}</div> \
        </span> \
        : \
        <span class="countdown-group"> \
          <span class="countdown-number">{{seconds}}</span> \
          <div class="countdown-label">second{{secondsS}}</div> \
        </span> \
      </timer>');
      $element.find('#timerWrapper').append(timerNode);
      $compile(timerNode)($scope);
    });
  });
  
  
}
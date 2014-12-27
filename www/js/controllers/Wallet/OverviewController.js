angular.module("omniControllers")
  .controller("WalletOverviewController", ["$scope","Account","$location","Wallet",
    function WalletOverviewController($scope,Account,$location,Wallet){
      $scope.uuid = Account.uuid;
      $scope.loginLink = $location.protocol() + "://" + $location.host() + "/login/" + $scope.uuid;
      //console.log(Wallet.addresses);
      $scope.firstLogin = Account.firstLogin;
      $scope.CSYM=Account.getSetting("usercurrency");
      $scope.total=0;
      $scope.chartConfig = {
        tooltips: true,
        mouseover: function() {},
        mouseout: function() {},
        click: function() {}
      };

      $scope.balanceData = {
        data: []
      };

      function refresh(){
        $scope.total = 0;
        Wallet.assets.forEach(function(asset) {
          $scope.total += +asset.value;

          var add = true;
          $scope.balanceData.data.forEach(function(data){
            if(data.x==asset.symbol){
              data.y = [asset.value];
              add = false;
            }
          })
          if(add)
            $scope.balanceData.data.push({x:asset.symbol,y:[asset.value],tooltip:asset.symbol+": "+typeof(asset.value) == Number?"$"+asset.value.toFixed(2):asset.value})
        });
      }

      $scope.disclaimerSeen = Account.settings.disclaimerSeen;
      $scope.$on('$locationChangeSuccess', function(path) {
        Account.settings.disclaimerSeen = true;
      })

      $scope.$on("BALANCE_CHANGED",function(evt,changed,values){
        refresh();
      })
      $scope.$on("APPRAISER_VALUE_CHANGED",function(evt,changed){
        refresh();
      })

      refresh();
    }]);

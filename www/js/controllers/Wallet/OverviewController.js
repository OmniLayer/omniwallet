angular.module("omniControllers")
  .controller("WalletOverviewController", ["$scope","Account","$location","Wallet","ModalManager",
    function WalletOverviewController($scope,Account,$location,Wallet,ModalManager){
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
      
      $scope.showtesteco = Account.getSetting('showtesteco');

      $scope.openBackupModal=function(){
        ModalManager.openBackupWalletModal();
      }

      $scope.openImportModal=function(){
        ModalManager.openImportWalletModal();
      }

      function refresh(){
        $scope.total = 0;
        var balanceData = {
          data: []
        };
        Wallet.assets.forEach(function(asset) {
          $scope.total += (typeof(asset.value) == "number"?+asset.value:0);

          var add = true;
          balanceData.data.forEach(function(data){
            if(data.x==asset.symbol){
              data.y = [asset.value];
              add = false;
            }
          })
          if(add)
            balanceData.data.push({x:asset.symbol,y:[asset.value],tooltip:asset.symbol+": "+(typeof(asset.value) == "number"?"$"+asset.value.toFixed(2).toString():asset.value)})
        });

        $scope.balanceData= balanceData;
      }

      $scope.disclaimerSeen = Account.settings.disclaimerSeen;
      $scope.$on('$locationChangeSuccess', function(path) {
        Account.settings.disclaimerSeen = true;
      })

      $scope.$on("balance:changed",function(evt,changed,values){
        refresh();
      })
      $scope.$on("APPRAISER_VALUE_CHANGED",function(evt,changed){
        refresh();
      })

      refresh();
    }]);

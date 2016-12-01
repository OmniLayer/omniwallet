angular.module("omniControllers")
  .controller("WalletOverviewController", ["$scope","$location","Wallet","ModalManager","$filter",
    function WalletOverviewController($scope,$location,Wallet,ModalManager,$filter){
      $scope.uuid = $scope.account.uuid;
      $scope.loginLink = $location.protocol() + "://" + $location.host() + "/login/" + $scope.uuid;
      //console.log(Wallet.addresses);
      $scope.firstLogin = $scope.account.settings.firstLogin;
      $scope.CSYM=$scope.account.getSetting("usercurrency");
      $scope.total=0;
      $scope.chartConfig = {
        chart: {
                type: 'pieChart',
                height: 500,
                x: function(asset){return $filter('truncate')(asset.name,10);},
                y: function(asset){return asset.value;},
                showLabels: true,
                transitionDuration: 500,
                labelThreshold: 0.01,
                legend: {
                    margin: {
                        top: 5,
                        right: 35,
                        bottom: 5,
                        left: 0
                    }
                }
            }
      };
      
      $scope.showtesteco = $scope.account.getSetting('showtesteco');

      $scope.chartData = getChartData();

      function getChartData(){
        ret=[]
        angular.forEach(Wallet.assets, function(asset,key){
          if (parseFloat(asset.value) > 0) {
            ret.push({'name':asset.name, 'value':asset.value});
          }
        })
        return ret;
      }

      $scope.openBackupModal=function(){
        ModalManager.openBackupWalletModal();
      }

      $scope.openImportModal=function(){
        ModalManager.openImportWalletModal();
      }

      function refresh(){
        $scope.total = 0;

        Wallet.assets.forEach(function(asset) {
          $scope.total += parseFloat(asset.value);
        });

        $scope.chartData = getChartData();
      }

      $scope.disclaimerSeen = $scope.account.settings.disclaimerSeen;
      $scope.$on('$locationChangeSuccess', function(path) {
        $scope.account.settings.disclaimerSeen = true;
      })

      $scope.$on("balance:changed",function(evt,changed,values){
        refresh();
      })
      $scope.$on("APPRAISER_VALUE_CHANGED",function(evt,changed){
        refresh();
      })

      refresh();
    }]);

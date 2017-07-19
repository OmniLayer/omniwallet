angular.module("omniControllers")
  .controller("WalletOverviewController", ["$scope","$location","Wallet","ModalManager","$filter", "$http",
    function WalletOverviewController($scope,$location,Wallet,ModalManager,$filter, $http){
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

      function refresh() {
        $scope.total = 0;
        
        // find object assets
        const objectAssets = Wallet.assets.filter(function (asset) { return asset.url !== undefined && asset.url.indexOf("vatomic") !== -1 });
        
        // always resolves the passed promise, so we can use Promise.all to run all promises regardless
        // of past failures, and collect the results/failures after
        function reflect(promise, extraData) {
          return promise.then(function (v) { return { v: v, status: "resolved", extraData } }).catch(
            function (e) { return { e: e, status: "rejected", extraData } });
        }
        
        // refresh objects
        Promise.all(objectAssets.map(function (objectAsset, i) {
          return reflect($http({ method: "GET", url: objectAsset.url, withCredentials: false })
            .then(function (response) {
              var contentType = response.headers("content-type");
              if (contentType && contentType.includes("application/json")) {
                return response.data;
              }
              
              return new Error("Object definition url did not resolve with 'application/json' content-type.");
            })
            .then(function(objectDef) { return ({ objectDef, name: objectAsset.name, quantity: Number.parseInt(objectAsset.totaltokens), url: objectAsset.url, propertyid: objectAsset.propertyid }) }), { objectAsset });
        }))
        .then(function(resolvedObjects) {
          resolvedObjects.filter(function (obj) { return obj.status === "rejected" }).forEach(function(obj) {
            console.error(`failed to resolve external object information from defined "url" http endpoint for "${obj.extraData.objectAsset.name}"`, obj.extraData.objectAsset, obj.e);
          });
          
          return resolvedObjects
            .filter(function (obj) { return obj.status === "resolved" })
            .map(function (obj) { return obj.v })
            .filter(function (obj) { return obj.objectDef.id !== undefined })
            .filter(function (obj) { return $scope.showtesteco === "true" || obj.propertyid < 2147483648 })
            .map(function (obj) {
              // todo: setup for eventual uit support
              return new Array(1).fill(0).map(function () { return obj; });
            })
            .reduce(function (prev, curr) { return prev.concat(curr) }, []);
        })
        .then(function (inventory) {
          if ($scope.inventory === undefined || $scope.inventory.length !== inventory.length) {
            console.log(`resolved and updated ${inventory.length} objects in inventory`);
            
            $scope.inventory = inventory;
            $scope.$apply();
          }
        });

        Wallet.assets.forEach(function (asset) {
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
      
      $scope.startVatomIconTouch = function (object, event) {
        $scope.originalMoveLocation = { x: event.clientX, y: event.clientY };
        $scope.shouldOpenVatom = true;
      };
      
      $scope.endVatomIconTouch = function (object, event) {
        if ($scope.shouldOpenVatom) {
          $scope.isModalOpen = true;
          $scope.selectedObject = object;
          $scope.originalMoveLocation = undefined;
          
          if (object.objectDef.faces.some(function (face) {
            return face.properties.constraints.platform === "web" && face.properties.constraints.view_mode === "fullscreen";
          })) {
            $scope.isCardOpen = true;
          }
          else {
            $scope.isCardOpen = false;
          }
          
          $scope.isCardAvailable = object.objectDef.faces.some(function (face) {
            return face.properties.constraints.platform === "web" && ( face.properties.constraints.view_mode === "fullscreen" || face.properties.constraints.view_mode === "card");
          });
        }
      };
      
      $scope.panVatomIconTouch = function (object, event) {
        var MAX_CLICK_DIST = 5;
        
        if ($scope.originalMoveLocation !== undefined && (Math.abs($scope.originalMoveLocation.x - event.clientX) > MAX_CLICK_DIST || Math.abs($scope.originalMoveLocation.y - event.clientY) > MAX_CLICK_DIST) && $scope.shouldOpenVatom) {
          $scope.shouldOpenVatom = false;
        }
      };
      
      $scope.closeVatom = function () {
        $scope.isModalOpen = false;
        $scope.isCardOpen = false;
        $scope.selectedObject = undefined;
      };
      
      $scope.toggleVatomCard = function () {
        $scope.isCardOpen = !$scope.isCardOpen;
      };
      
      $scope.isModalOpen = false;
      $scope.isCardOpen = false;
    }]);

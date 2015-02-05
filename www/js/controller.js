

function StatsCtrl($scope, $route, $routeParams, $http) {

  $http.get('/v1/system/stats.json', {}).success(function(data) {
    $scope.stats = data;
  });
}



function HiddenLoginController($scope, $modal, $location) {
  $scope.open = function() {
    $scope.uuid = $location.path().replace("/login/", "");

    $modal.open({
      templateUrl: '/partials/login_modal.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function() {
          return $scope.uuid;
        }
      }
    });
  }
}

function FailedSaveLoginController($scope, $modal, $location) {
  $scope.open = function() {
    $scope.uuid = $location.path().replace("/loginfs/", "");

    $modal.open({
      templateUrl: '/partials/login_modal_fs.html',
      controller: LoginControllerUUID,
      resolve: {
        uuid: function() {
          return $scope.uuid;
        }
      }
    });
  }
}

function AccountSettingsController($modal, $injector, $scope, $http, Account) {

  mywallet = Account.wallet;
  $scope.wallet = mywallet;
  $scope.uuid = mywallet['uuid'];

  $scope.email = Account.getSetting('email');

  $http.get('/v1/values/currencylist').success(function(data) {
    $scope.currencylist = data;    
  }).error(function(){
    $scope.currencylist = [{'value':'USD','label':'United States Dollar'}];
  });

  $scope.selectedCurrency = Account.getSetting("usercurrency")
  $scope.filterdexdust = Account.getSetting("filterdexdust")
  $scope.donate = Account.getSetting("donate")
  $scope.showtesteco = Account.getSetting("showtesteco")

  $scope.label=function (name, abv) {
     return name+" ("+abv+")";
  }

  $scope.save = function() {
      if ($scope.myForm.$error.email) {
        $scope.saved = false;
        $scope.error = true;   
      } else {
        mywallet['email'] = $scope.email;
        mywallet['settings'] = { 'usercurrency':$scope.selectedCurrency,
                               'filterdexdust':$scope.filterdexdust, 
                               'donate':$scope.donate, 
                               'showtesteco':$scope.showtesteco };
        Account.wallet = mywallet;
        Account.saveSession();
        $scope.saved = true;
        $scope.error = false;
        Account.setCurrencySymbol($scope.selectedCurrency);
        var appraiser= $injector.get("appraiser");
        appraiser.updateValues();
      }
    };

  $scope.changePassword = function() {
    $scope.login = {
        uuid: Account.uuid,
        action: 'verify',
        title: 'Verify Current Password',
        button: 'Validate',
        disable: true //disable UUID field in template
      };
      var modalInstance = $modal.open({
        templateUrl: '/partials/login_modal.html',
        controller: LoginController,
        scope: $scope
      });
      modalInstance.result.then(function() {
          var newPasswordModal = $modal.open({
            templateUrl: '/partials/wallet_password_modal.html',
            controller: WalletPasswordController,
            scope: $scope
          });
          newPasswordModal.result.then(function() {
            $scope.saved = true;
            $scope.error = false;
          }, function() {
            $scope.saved = false;
            //Closing modal shouldn't generate an error
            //$scope.error = true;
          });
      });
  };
}

function ExplorerInspectorController($scope, $location, $http, hashExplorer) {
  function setData() {
    $scope.transactionData = JSON.parse(hashExplorer.tx);
    $scope.tx_keys = Object.keys($scope.transactionData);
    $scope.fieldlist = $scope.tx_keys;
    $scope.pastLoc = hashExplorer.loc;
  }

  if (hashExplorer.tx) {
    setData();
  } else {
    $http.get('/v1/transaction/tx/' + $location.search()['view'] + '.json'). success(function(data) {
      hashExplorer.setHash(data[0]);
      setData();
    });
  }
}

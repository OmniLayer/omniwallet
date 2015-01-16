
function SimpleSendController($scope, Account) {
  var wallet = Account.wallet;

  MySimpleSendHelpers(wallet);

}
function HomeCtrl($scope, $templateCache, $injector, $location, $http, $q, Account) {
  if (Account.uuid) {
    $location.url('/wallet/overview');
  } else {
    //DEV ONLY
    console.log('cleared cache');
    $templateCache.removeAll();

    $scope.balanceAddress = "";
    $scope.hasBalances = false;
    $scope.total = 0;
    $scope.validate = function(address) {
      //console.log('checking '+address);
      return Bitcoin.Address.validate(address);
    };
    $scope.checkBalance = function() {
      var balances = {};
      var appraiser = $injector.get('appraiser');
      $injector.get('balanceService').balance($scope.balanceAddress).then(function(result) {
        result.data.balance.forEach(function(currencyItem, index, collection) {
          if(currencyItem.divisible) {
            var value=new Big(currencyItem.value).times(WHOLE_UNIT).valueOf();
            var pendingpos= new Big(currencyItem.pendingpos).times(WHOLE_UNIT).valueOf();
            var pendingneg= new Big(currencyItem.pendingneg).times(WHOLE_UNIT).valueOf();
          } else {
            var pendingpos=currencyItem.pendingpos;
            var pendingneg=currencyItem.pendingneg;
          }
          appraiser.updateValue(function() {
            balances[currencyItem.symbol] = {
              "symbol": currencyItem.symbol,
              "balance": +value || currencyItem.value,
              "value": appraiser.getValue(currencyItem.value, currencyItem.symbol, currencyItem.divisible),
              "pendingpos": +pendingpos,
              "pendingneg": +pendingneg
            };
            if (currencyItem.symbol == 'BTC') {
              balances[currencyItem.symbol].name = "Bitcoin";
            }

            if (Object.keys(balances).length < collection.length)
              return;
          
            $http.get('/v1/transaction/values.json').then(function(result) {
              currencyInfo = result.data;

              currencyInfo.forEach(function(item) {
                if (balances.hasOwnProperty(item.currency))
                  balances[item.currency].name = item.name;
              });

              // Now, any applicable smart properties.
              var spReqs = [];

              for (var b in balances) {
                var spMatch = balances[b].symbol.match(/^SP([0-9]+)$/);

                if (spMatch != null) {
                  var updateFunction = function(result) {
                    if (result.status == 200) {
                      this.property_type = result.data[0].formatted_property_type;
                      this.name = result.data[0].propertyName + ' (' + this.symbol.match(/^SP([0-9]+)$/)[1] + ')';
                    }
                  };
                  spReqs.push($http.get('/v1/property/' + spMatch[1] + '.json').then(updateFunction.bind(balances[b])));
                }
              }

              if (spReqs.length > 0) {
                $q.all(spReqs).then(function() {
                  $scope.balances = balances;
                  $scope.hasBalances = true;
                });
              } else {
                $scope.balances = balances;
                $scope.hasBalances = true;
              }
            });
          }, currencyItem.symbol);
        });
      });
    };

  }
}
function StatsCtrl($scope, $route, $routeParams, $http) {

  $http.get('/v1/system/stats.json', {}).success(function(data) {
    $scope.stats = data;
  });
}

function Ctrl($scope, $route, $routeParams, $modal, $location, browser, Account) {

  $scope.$route = $route;
  $scope.$location = $location;
  $scope.browser = browser;
  $scope.Account = Account;

  /*$scope.$on('$locationChangeStart', function(event, next) {
    if (browser === 'chrome') {
      return;
    }

    event.preventDefault();

    $modal.open({
      backdrop: 'static',
      templateUrl: '/partials/browser_message_modal.html'
    });
  });*/

  $scope.templates = {
    'header': '/header.html',
    'footer': '/footer.html',
    'sidecar': '/partials/sidecar.html',
    'add_address': '/partials/add_address.html',
    'disclaimer': '/partials/disclaimer.html'
  };

  $scope.events = [];

  $scope.$on('$idleStart', function() {
    if (Account.loggedIn) {
      var originalTitle = document.title;

      $modal.open({
        backdrop: 'static',
        controller: function ($injector, $scope, $http, $location, $modalInstance, $interval, $idle) {
          $idle.unwatch();

          var idleEndTimeFormat = function (idleEndTime) {
            var info = [
              (idleEndTime >= 60 ? parseInt(idleEndTime / 60) + ' minute' + (parseInt(idleEndTime / 60) > 1 ? 's' : '') : undefined),
              (idleEndTime % 60 > 0  ? (idleEndTime % 60) + ' second' + (idleEndTime % 60 > 1 ? 's' : '') : undefined),
            ]

            var i = info.length;
            while (i--) {
              if (!info[i]) {
                info.splice(i, 1);
              }
            }

            return info.length > 0 ? 'in ' + info.join(' and ') : 'now';
          };

          $scope.idleEndTime = $idle._options().warningDuration;
          $scope.idleEndTimeFormatted = idleEndTimeFormat($scope.idleEndTime);
          document.title = 'Omniwallet\u2122 - Session time out ' + $scope.idleEndTimeFormatted;

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
          
          var timer = $interval(function () {
            $scope.idleEndTime--;
            if ($scope.idleEndTime === 0) {
              $interval.cancel(timer);
              location = location.origin + '/login/' + Account.uuid
            }

            $scope.idleEndTimeFormatted = idleEndTimeFormat($scope.idleEndTime);
            document.title = 'Omniwallet\u2122 - Session time out ' + $scope.idleEndTimeFormatted;
          }, 1000);

          $modalInstance.result.then(
            function () {
              document.title = originalTitle;
              $idle.watch();
              $interval.cancel(timer);
            },
            function () {
              document.title = originalTitle;
              $idle.watch();
              $interval.cancel(timer);
            }
          );
        },
        templateUrl: '/partials/idle_warning_modal.html'
      });
    }
  });

  $scope.$on('$idleWarn', function(e, countdown) {
    console.log('Idle warn');
  });

  $scope.$on('$idleTimeout', function() {
    /*if (Account.isLoggedOn) {
      location = location.origin + '/login/' + Account.uuid
    }*/
  });

  $scope.$on('$idleEnd', function() {
    
  });

  $scope.$on('$keepalive', function() {
    
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

function RevisionController($scope, $http, $modal) {

  $scope.getData = function() {
    console.log('init 0');
    $http.get('/v1/system/revision.json', {}).success(function(data) {
      $scope.rev = data;
    });
  };
}

function ExplorerController($scope, $http, hashExplorer) {
  $scope.setHashExplorer = hashExplorer.setHash.bind(hashExplorer);
  // Scope members
  $scope.searchQueryText = '';
  $scope.searchRan = false;
  $scope.searchQueryReturned=false;
  $scope.transactions = [];
  $scope.currencies = ['MSC', 'TMSC'];
  $scope.currency = 'MSC';

  $scope.getData = function getData() {
    var currency = $scope.currency;
    $http.get('/v1/transaction/values.json', {}). success(function(data) {
      for (var i = 0; i < data.length; i++) {
        if (currency == data[i].currency) {
          var file = '/v1/transaction/general/' + currency + '_0001.json';
          $http.get(file, {}).success(function(data, status, headers, config) {

            angular.forEach(data, function(transaction, index) {

              data[index].utc_time = new Date(+transaction.tx_time).toUTCString().replace('GMT','');
              //DEBUG console.log(new Date(Number(transaction.tx_time)))
              data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'
            });

            $scope.transactions = data;
            $scope.searchQueryText = '';
            $scope.searchRan = false;
            $scope.searchQueryReturned=false;
          });
        }
      }
    });
  }
  $scope.doSearch = function() {
    if( $scope.searchQueryText == undefined || $scope.searchQueryText == '' || $scope.searchQueryText.length < 4 )
      return -1;
    $scope.searchRan=true;
    $scope.searchQueryReturned=false;
    var file = '/v1/search/';
    $http.get('/v1/search/?query=' + $scope.searchQueryText, {}).success(function(successData, status, headers, config) {
      angular.forEach(successData.data, function(transaction, index) {
        //DEBUG console.log(transaction)
        successData.data[index].utc_time = new Date(+transaction.tx_time).toUTCString().replace('GMT','');
        successData.data[index].tx_hash_concat = transaction.tx_hash.substring(0, 22) + '...'
      });

      //Sort by date
      successData.data = successData.data.sort(function(a, b) {
        return b.tx_time - a.tx_time;
      });

      if ($scope.searchQueryText == "")
        $scope.searchQueryText = hashExplorer.search

      $scope.transactions = successData.data;
      $scope.searchQueryReturned=true;
      $scope.searchQueryReturnedText=[ successData.data.length, $scope.searchQueryText.slice(0,7) + ( $scope.searchQueryText.length > 7 ? '...' : '' ) ];
      hashExplorer.setSearch( $scope.searchQueryText );
    });
  };
  $scope.searchQuery = function(trans) {
    return ($scope.searchQueryText === '' || trans.tx_hash.indexOf($scope.searchQueryText) >= 0 || trans.from_address.indexOf($scope.searchQueryText) >= 0 || trans.to_address.indexOf($scope.searchQueryText) >= 0);
  };        

  //set up state
  if (hashExplorer.tx != '') {
    $scope.searchQueryText = hashExplorer.search;
    $scope.doSearch();
  }
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
function SidecarController($rootScope, $scope, $http, $modal, $location, Account, balanceService, Wallet) {
  $scope.values = {};
  $scope.setView = function(viewName) {
    $scope.view = $scope.sidecarTemplates[viewName];
  };
  $scope.getView = function() {
    return $scope.view;
  };
  $scope.sidecarTemplates = {
    'explorer': '/partials/explorer_sc.html',
    'about': '/partials/about_sc.html',
    'wallet': '/partials/wallet_sc.html'
  };

  $scope.hasAddresses = Account.loggedIn && Wallet.addresses.length != 0 ? true : false;
  $scope.hasAddressesWithPrivkey = Account.loggedIn && getAddressesWithPrivkey().length != 0 ? true : false;
  $scope.hasTradableCoins = false;
  $scope.hasBTC = false;
  if (Account.loggedIn) checkBalance(Wallet.addresses);
  
  $scope.goToTradePage = function($event){
    if($location.path() == "/wallet/trade")
      $rootScope.$broadcast("setView",{view:"tradeInfo"});
    else
      $location.path("/wallet/trade");
  };
  
  $scope.checkSendingEnabled = function($event) {
    var error = "Cannot send anything because ";
    if(!$scope.hasAddressesWithPrivkey){
      $event.preventDefault();
      $event.stopPropagation();
      error += "the wallet has no addresses with private keys (no address to send from)";
    } else {
      if(!$scope.hasTradableCoins){
        $event.preventDefault();
        $event.stopPropagation();
        error += "the wallet has no coins in the addresses that have private keys (nothing to send)";
      } else {
        if(!$scope.hasBTC){
          $event.preventDefault();
          $event.stopPropagation();
          error += "wallet has no BTC in addresses that have private keys (no way to pay tx fees)";
        } 
      }
    }
    
    if(error.length > 33){
      $modal.open({
        templateUrl: "/partials/popup_error.html",
        controller: function($scope, error){
          $scope.error = error;
        },
        resolve:{
          error:function(){
            return error;
          }
        }
      });
    } else {
      $location.path("/wallet/send");
    }
  };

  $scope.$watch(function() {
    return Wallet.addresses
  }, function(result) {
    $scope.hasAddresses = Account.loggedIn && result.length != 0 ? true : false;
    $scope.hasAddressesWithPrivkey = Account.loggedIn && getAddressesWithPrivkey().length != 0 ? true : false;
    if (Account.loggedIn) checkBalance(Wallet.addresses);
  }, true);

  function getAddressesWithPrivkey() {
    var addresses = []
    Wallet.addresses.map(function(e, i, a) {
      if (e.privkey && e.privkey.length == 58) {
        addresses.push(e.address);
      }
    }
    );
    return addresses;
  }

  function checkBalance(addresses){
    $scope.hasTradableCoins = false;
    $scope.hasBTC = false;
    if(addresses instanceof Array){
      addresses.forEach(function(address){
          address.balance.forEach(function(balance){
            if(balance.value > 0)
              $scope.hasTradableCoins = true;
            if(balance.symbol == "BTC" && balance.value > 0)
              $scope.hasBTC = true;
          });
      });
    }
  }
}


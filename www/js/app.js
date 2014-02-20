angular.module('omniwallet', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.modal'
  ],
  function($routeProvider, $locationProvider, $httpProvider) {
    
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.transformRequest = [TransformRequest];

    $routeProvider.when('/wallet/:page?', {
      templateUrl: function(route) {       
        //new views added here
        var availableViews = ['overview','addresses','send', 'trade', 'history'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/wallet_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
      }
    }).otherwise({ redirectTo: '/wallet' });

    $routeProvider.when('/explorer/:page?', {
       templateUrl: function(route) {       
        var availableViews = ['overview','assets','bookmarks', 'following'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/explorer_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
       }
    }).otherwise({ redirectTo: '/explorer' });
    
    $routeProvider.when('/about/:page?', {
       templateUrl: function(route) {       
        var availableViews = ['omniwallet','mastercoin','contact', 'help'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) //Default view
          route.page = 'omniwallet';
        
        var view = '/about_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
       }
    }).when('/', {
       templateUrl: 'homepage.html',
       controller: HomeCtrl
    }).when('/login', {
      templateUrl: 'login.html',
    }).when('/create', {
      templateUrl: 'create_wallet.html',
    }).otherwise({ redirectTo: '/' });

    $locationProvider.html5Mode(true).hashPrefix('!');
});

function SimpleSendController($scope, userService) {
  var wallet = userService.getWallet();

  MySimpleSendHelpers(wallet);

}
function HomeCtrl($templateCache) {
  //DEV ONLY
  $templateCache.removeAll()

}
function ExplorerCtrl() {
}
function TradeCtrl() {
}
function WalletController() {
  console.log('initialized wallet')
}

function AboutCtrl($scope, $location) {
}

function Ctrl($scope, $route, $routeParams, $location) {
  
  $scope.$route = $route
  $scope.$location = $location
     
  $scope.templates = { 
        'header': 'header.html', 
        'footer': 'footer.html',
        'sidecar': 'sidecar.html'
  };

}

function NavigationController($scope, $http, userService) {
    $scope.values = {};
    
    $scope.getNavData = function() {
      console.log('init 0');
    }
    console.log(userService);
     
    $scope.user = userService.data;
}

function BTCController($scope, $http) {
    // Scope members
    $scope.transactions = {};
    $scope.currency = 'MSC'
    
    $scope.getData = function getData() {  
      var file =  '/v1/transaction/general/TMSC_0001.json';
      $http.get( file, {}).success(
        function (data, status, headers, config) {
          $scope.transactions = data;
          console.log($scope.transactions);
      });
    }
}

function WalletHistoryController($scope, $http) {
  console.log('initialized wallet history')
  $scope.getData = function getData(address) {
    var file = '/v1/address/addr/' + address + '.json'; 
    $http.get( file, {} ).success(
      function(data, status, headers, config) {

        $scope.address = data.address;

        delete data.address;
        delete data.balance;
        
        var transaction_data = []
        angular.forEach(data[0], function(msc_tx, tx_type ) {
          if( msc_tx instanceof Array && msc_tx.length != 0 ) {
            console.log(tx_type, msc_tx);
            transaction_data = transaction_data.concat(msc_tx);
          }
        });
        
        angular.forEach(data[1], function(tmsc_tx, tx_type) {
          if( tmsc_tx instanceof Array && tmsc_tx.length != 0 ) {
            console.log(tx_type, tmsc_tx);
            transaction_data = transaction_data.concat(tmsc_tx);
          }
        });

        //sort by date, ascending
        transaction_data = transaction_data.sort(function(a,b) {
            return b.tx_time - a.tx_time;
        });
        
        //DEBUG angular.forEach(transaction_data, function(transaction, index) {
        //DEBUG console.log(new Date(Number(transaction.tx_time)))
        //DEBUG });

        $scope.history = transaction_data;
      });
  }
}

function WalletSendController($scope) {
  console.log('initialized wallet')

  $scope.currList = ['MSC', 'TMSC', 'BTC']
  $scope.addrList = ['1Sochi', '1Enjoy', '1Balding']
  $scope.fakeData = ['23200','232113$USD']
}

function SidecarController($scope, $http) {
    $scope.values = {};
    $scope.setView = function(viewName) {
        $scope.view = $scope.sidecarTemplates[viewName]
    };
    $scope.getView = function() {
       return $scope.view;
    }
    $scope.sidecarTemplates = {
          'explorer':'explorer_sc.html',
          'about': 'about_sc.html',
          'trade': 'trade_sc.html',
          'wallet': 'wallet_sc.html'
    };

}

angular.module('omniwallet').directive('omSelect', function() {
   return {  
      template: '<div class="form-inline col-xs-4"> \
        {{text}}    \
        <select class="form-control">  \
          <option ng-repeat="option in options"> {{option}} </option>   \
        </select>   \
      </div> ',
      scope: { 
        localOptions: '@options'
      },
      link: function link(scope, iElement, iAttrs) {
        //DEBUG console.log(typeof iAttrs.options, scope)
        scope.options = JSON.parse(scope.localOptions)
        scope.text = iAttrs.text
      }
   }
});

angular.module('omniwallet').directive('omInput', function() {
   return {  
      template: '<div class="input-group">   \
      <span class="input-group-addon"> {{text}} </span>  \
      <input type="text" class="form-control">  \
      </div>',
      scope: {
        addons: '@'
      },
      link: function link(scope, iElement, iAttrs) {

        scope.text = iAttrs.text
        
        iElement.find('.input-group').addClass(iAttrs.addclass)
        
        if( iAttrs.value )
          iElement.find('.form-control').attr('value',iAttrs.value)
        else
          iElement.find('.form-control').attr('placeholder',iAttrs.placeholder)

        if( iAttrs.disable ) {
          iElement.find('.form-control').attr('disabled','')
        }

        if( iAttrs.addons ) {
          scope.addons = iAttrs.addons.split(',');

          for( var i = scope.addons.length-1; i >= 0; i--) {
            iElement.find('.form-control')
                .after('<span class="input-group-addon">' + scope.addons[i] + ' </span>');
          }
        }
      }
   }
});

angular.module( 'omniwallet' ).factory('userService', ['$rootScope', function ($rootScope) {
  // Rewire to use localstorage 
  var service = {
    data: {
      loggedIn: false,
      username: '',
      "uuid":"39cd5e05-aa4a-400c-c4c4-9fe70332bd01",
      "addresses":[ 
              
      ]
    },

    saveSession: function () {
      localStorage["Wallet"] = angular.toJson(service.data)
    },
    restoreSession: function() {
      service.data = angular.fromJson(localStorage["Wallet"]);
    }
  };

  // $rootScope.$watch('userService.data', function(newVal, oldVal) {
  //   console.log("watched");
  //   $rootScope.$broadcast('savestate');
  // }, true);
  $rootScope.$on("savestate", service.saveSession);
  $rootScope.$on("restorestate", service.restoreSession);

  return service;
}]);

function TransformRequest(data) { 
  var param = function(obj) {
    var query = '';
    var name, value, fullSubName, subName, subValue, innerObj, i;

    for(name in obj) {
      value = obj[name];

      if(value instanceof Array) {
        for(i=0; i<value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value instanceof Object) {
        for(subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      }
      else if(value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
}

var app = angular.module('omniwallet', ['ngRoute'],
  function($routeProvider, $locationProvider, $httpProvider) {
    
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.transformRequest = [TransformRequest];

    $routeProvider.when('/wallet/:page?', {
      templateUrl: function(route) {       
        //new views added here
        var availableViews = ['overview','addresses','send', 'history'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/wallet_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
      }
    }).otherwise({ redirectTo: '/wallet' });
    $routeProvider.when('/trade/:page?', {
       templateUrl: function(route) {       
        var availableViews = ['overview','book','charts', 'alerts'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/trade_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
       }
    }).when('/explorer/:page?', {
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
  $templateCache.removeAll();
}
function ExplorerCtrl() {
}
function TradeCtrl() {
}
function WalletController() {
  console.log('initialized wallet')
}
function WalletHistoryController() {
  console.log('initialized wallet history')
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


function RevisionController($scope, $http) {
    $scope.revision = {};
    
    $scope.getData = function () {
      console.log('init 2')
    }
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

app.factory('userService', ['$rootScope', function ($rootScope) {
  // Rewire to use localstorage 
  var service = {
    data: {
      loggedIn: false,
      username: '',
      uuid: '',
      addresses: [
        {
          privateKey: '',
          address: ''
        }
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

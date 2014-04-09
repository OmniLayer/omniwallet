//global config goes here

var app = angular.module('omniwallet', [
    'ngRoute',
    'ui.bootstrap',
    'ui.bootstrap.modal',
    'vr.filters.passwordStrength'
  ],
  function($routeProvider, $locationProvider, $httpProvider) {
    
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
    $httpProvider.defaults.transformRequest = [TransformRequest];

    $routeProvider.when('/wallet/:page?', {
      templateUrl: function(route) {       
        //new views added here
        var availableViews = ['overview','addresses', 'trade', 'history', 'send', 'pending'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/partials/wallet_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
      }
    }).otherwise({ redirectTo: '/wallet' });

    $routeProvider.when('/explorer/:page?', {
       templateUrl: function(route) {       
        var availableViews = ['overview','assets','bookmarks', 'following', 'inspector'];
        
        var viewFound = availableViews.indexOf(route.page);
        if( viewFound == -1 ) 
          route.page = 'overview';
        
        var view = '/partials/explorer_' + route.page + '.html';
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
        
        var view = '/partials/about_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')
        return view
       }
    }).when('/', {
       templateUrl: '/homepage.html',
       controller: HomeCtrl
    }).when('/login/:uuid', {
       template: '<div ng-controller="HiddenLoginController" ng-init="open()"></div>',
       controller: HiddenLoginController
    }).when('/import', {
      templateUrl: '/partials/wallet_import.html',
    }).when('/stats', {
       templateUrl: '/stats.html',
       controller: StatsCtrl
    }).otherwise({ redirectTo: '/' });

    $locationProvider.html5Mode(true).hashPrefix('!');
});


app.config(function() {}).run(function(userService, $location) {
  //Whitelist pages
  whitelisted = ['login', 'about', 'stats', 'explorer']; 

  if(!userService.loggedIn()) {
    for(var i = 0; i < whitelisted.length; i++) {
      if($location.path().search(whitelisted[i]) != -1) {
        return;
      }
    }
    $location.path('/');
  }
});

//app helpers
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

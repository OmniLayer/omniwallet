//Define Modules here first
angular.module("omniConfig")
  .factory("TESTNET",["$location",function TestnetFactory($location){
    if($location.host().match('testnet') != null){
      Bitcoin.setNetwork('test');
      return true;
    } else
      return false;
  }])
  .factory("TX_DATA_URL",["TESTNET", function TxDataUrlFactory(TESTNET){
    if(TESTNET)
      return "http://tbtc.blockr.io/tx/info/";
    else
      return "https://blockchain.info/tx/";
  }]);

angular.module("omniFactories", ["omniConfig"]);
angular.module("omniServices", ["omniConfig", "omniFactories"]);
angular.module("omniControllers", ["omniConfig", "omniFactories", "omniServices"]);

var app = angular.module('omniwallet', [
  'ngRoute',
  'ui.bootstrap',
  'ui.bootstrap.modal',
  'ngNumeraljs',
  'vr.filters.passwordStrength',
  'ngIdle',
  'reCAPTCHA',
  'pascalprecht.translate',
  'omniConfig',
  'omniFactories',
  'omniServices',
  'omniControllers'
], function($routeProvider, $locationProvider, $httpProvider) {

  if (!$httpProvider.defaults.headers.get)
        $httpProvider.defaults.headers.get = {};    
  $httpProvider.defaults.headers.get['Cache-Control'] = 'no-cache, no-store, must-revalidate'; 
  $httpProvider.defaults.headers.get['Pragma'] = 'no-cache'; 
  $httpProvider.defaults.headers.get['Expires'] = '0'; 
  $httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';
  $httpProvider.defaults.transformRequest = [TransformRequest];

  if (document.location.href.match('testnet') != null) {
    Bitcoin.setNetwork('test');
    TESTNET=true;
  } else {
    TESTNET=false;
  }

  $routeProvider.when('/dex/:page?', {
      templateUrl: function(route) {
        //new views added here
        var availableViews = ['overview','sale'];

        var view;
        var viewFound = availableViews.indexOf(route.page);
        if (viewFound != -1)
          view = '/views/DEx/' + route.page + '.html';
        else
          view = '/views/DEx/overview.html';

        ga('send', 'event', 'button', 'click', route.page);
        return view;
      }
    }).otherwise({
      redirectTo:'/dex/overview'
    });

  $routeProvider.when('/assets/:page?', {
      templateUrl: function(route) {
        //new views added here
        var availableViews = ['issue','crowdsale'];

        var view;
        var viewFound = availableViews.indexOf(route.page);
        if (viewFound != -1)
          view = '/partials/wallet_assets_' + route.page + '.html';
        else
          view = '/partials/explorer_assets.html';

        ga('send', 'event', 'button', 'click', route.page);
        return view;
      }
    }).otherwise({
      redirectTo:'/explorer/assets'
    });

  $routeProvider.when('/wallet/:page?', {
      templateUrl: function(route) {
        //new views added here
        var availableViews = ['overview', 'addresses', 'trade', 'history', 'send', 'myoffers', 'settings'];

        var viewFound = availableViews.indexOf(route.page);
        if (viewFound == -1)
          route.page = 'overview';

        var view = '/partials/wallet_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')

        ga('send', 'event', 'button', 'click', route.page);
        return view
      }
    }).otherwise({
    redirectTo: '/wallet'
  });

  $routeProvider.when('/explorer/:page?', {
      templateUrl: function(route) {
        var availableViews = ['overview', 'assets', 'bookmarks', 'following', 'inspector'];

        var viewFound = availableViews.indexOf(route.page);
        if (viewFound == -1)
          route.page = 'overview';

        var view = '/partials/explorer_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')

        ga('send', 'event', 'button', 'click', route.page);
        return view
      }
    }).otherwise({
    redirectTo: '/explorer'
  });

  $routeProvider.when('/about/:page?', {
      templateUrl: function(route) {
        var availableViews = ['omniwallet', 'mastercoin', 'contact', 'faq' ];

        var viewFound = availableViews.indexOf(route.page);
        if (viewFound == -1) //Default view
          route.page = 'omniwallet';

        var view = '/partials/about_' + route.page + '.html';
        //DEBUG console.log(view, route.page, view == '/wallet_addresses.html')

        ga('send', 'event', 'button', 'click', route.page);
        return view
      }
    }).when('/', {
      templateUrl: '/homepage.html',
      controller: HomeCtrl
    }).when('/login/:uuid', {
      template: '<div ng-controller="HiddenLoginController" ng-init="open()"></div>',
      controller: HiddenLoginController
    }).when('/loginfs/:uuid', {
      template: '<div ng-controller="FailedSaveLoginController" ng-init="open()"></div>',
      controller: FailedSaveLoginController
    }).when('/import', {
      templateUrl: '/partials/wallet_import.html',
    }).when('/status', {
      templateUrl: '/status.html',
      controller: StatsCtrl
    }).otherwise({
    redirectTo: '/'
  });

  $locationProvider.html5Mode(true).hashPrefix('!');
});

app.config(function($idleProvider, $keepaliveProvider, reCAPTCHAProvider, idleDuration, idleWarningDuration, reCaptchaKey, $translateProvider, EnglishTranslation) {
  $idleProvider.idleDuration(idleDuration);
  $idleProvider.warningDuration(idleWarningDuration);
  // $keepaliveProvider.interval(2);
  // required: please use your own key :)
  reCAPTCHAProvider.setPublicKey(reCaptchaKey);

  // optional: gets passed into the Recaptcha.create call
  reCAPTCHAProvider.setOptions({
      theme: 'clean'
  });

  $translateProvider.translations('en', EnglishTranslation);
   
  $translateProvider.preferredLanguage('en');
})
.run(function(Account, $location, TESTNET) {
  //Whitelist pages
  whitelisted = ['login', 'about', 'status', 'explorer'];

  if (!Account.loggedIn) {
    for (var i = 0; i < whitelisted.length; i++) {
      if ($location.path().search(whitelisted[i]) != -1) {
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

    for (name in obj) {
      value = obj[name];

      if (value instanceof Array) {
        for (i = 0; i < value.length; ++i) {
          subValue = value[i];
          fullSubName = name + '[' + i + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value instanceof Object) {
        for (subName in value) {
          subValue = value[subName];
          fullSubName = name + '[' + subName + ']';
          innerObj = {};
          innerObj[fullSubName] = subValue;
          query += param(innerObj) + '&';
        }
      } else if (value !== undefined && value !== null) {
        query += encodeURIComponent(name) + '=' + encodeURIComponent(value) + '&';
      }
    }

    return query.length ? query.substr(0, query.length - 1) : query;
  };

  return angular.isObject(data) && String(data) !== '[object File]' ? param(data) : data;
}
app.directive('fixedHeader', ['$timeout', function ($timeout) {
    return {
        restrict: 'A',
        scope: {
            tableHeight: '@'
        },
        link: function ($scope, $elem, $attrs, $ctrl) {
            // wait for content to load into table and the tbody to be visible
            $scope.$watch(function () { return $elem.find("tbody").is(':visible') },
                function (newValue, oldValue) {
                    if (newValue === true) {
                        // wrap in $timeout to give table a chance to finish rendering
                        $timeout(function () {
                            // reset display styles so column widths are correct when measured below
                            $elem.find('thead, tbody').css('display', '');
                            // set widths of columns
                            $elem.find('th').each(function (i, thElem) {
                                thElem = $(thElem);
 
                                var columnWidth = thElem.width();
                                thElem.width(columnWidth);
                            });
                            $elem.find('td').each(function (j, tdElem) {
                                tdElem = $(tdElem);
 
                                var columnWidth = tdElem.width();
                                tdElem.width(columnWidth);
                            });
 
                            // set css styles on thead and tbody
                            $elem.find('thead').css({
                                'display': 'block',
                            });
 
                            $elem.find('tbody').css({
                                'display': 'block',
                                'height': $scope.tableHeight || '350px',
                                'overflow': 'auto',
                            });
 
                            var scrollBarWidth = $elem.find('thead').width() - $elem.find('tbody')[0].clientWidth;
                            if (scrollBarWidth > 0) {
                                $elem.find('tbody').each(function (i, elem) {
                                    $(elem).width($(elem).width() + scrollBarWidth);
                                });
                                $elem.find('thead').each(function (j, elem) {
                                    $(elem).width($(elem).width() - scrollBarWidth);
                                });
                            }
                        });
                    }
                });
        }
    }
}]);

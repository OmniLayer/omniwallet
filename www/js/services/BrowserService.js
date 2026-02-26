angular.module('omniwallet').factory('browser', ['$window', function($window) {
    var userAgent = $window.navigator.userAgent;

    var browsers = {
      chrome: /chrome/i,
      safari: /safari/i,
      firefox: /firefox/i,
      ie: /internet explorer/i
    };

    for (var key in browsers) {
      if (browsers[key].test(userAgent)) {
        return key;
      }
    }
  }]);
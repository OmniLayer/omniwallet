
myApp.run(function($rootScope) {
    $rootScope.$on('handlePagesEmit', function(event, args) {
        $rootScope.$broadcast('handlePagesBroadcast', args);
    });
});
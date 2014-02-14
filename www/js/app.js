function Ctrl($scope) {
   $scope.templates = { 
        'header': 'header.html', 
        'footer': 'footer.html',
        'middle': 'middle.html', 
        'sidecar': 'sidecar.html'};
}

function NavigationController($scope, $http) {
    $scope.values = {};
    
    $scope.getNavData = function() {
      console.log('init 0');
    }
}

function BTCController($scope, $http) {
    // Scope members
    $scope.transactions = {};
    $scope.caption = '';
    $scope.pages = {};
    $scope.showPages = 5;
    $scope.currentPageStart = 1;
    $scope.currentPage = 1;
    $scope.numberOfPages = 12; // this we will get somehow from the server
    $scope.firstLoad = true;
    $scope.prevClass='disabled';
    $scope.nextClass='';
    
}


function RevisionController($scope, $http) {
    $scope.revision = {};
    
    $scope.getData = function () {
      console.log('init 2')
    }
}

function SidecarController($scope, $http) {
    $scope.values = {};
    
    $scope.getInit = function() {
      console.log('init 3');
    }
}

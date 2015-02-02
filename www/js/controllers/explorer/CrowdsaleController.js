angular.module("omniControllers")
	.controller("ExplorerCrowdsalesController",["$scope", "PropertyManager", "$timeout","$http","$templateCache","$element","$compile",
		function ExplorerCrowdsalesController($scope, PropertyManager, $timeout, $http, $templateCache, $element, $compile){
		    $scope.crowdsales = [];
		    $scope.ecosystem = 2;
		    PropertyManager.getActiveCrowdsales($scope.ecosystem).then(function(result){
		        $scope.crowdsales=result.data.properties

		        $timeout(function (){
		        	return $http.get("/views/assets/partials/remaining_timer.html", {cache: $templateCache}).success(function(template) {
			            for (var i = 0; i < $scope.crowdsales.length; i++) {
		        		  
		        			var endTime = $scope.crowdsales[i].deadline;
		              		$element.find('#timerWrapper-'+$scope.crowdsales[i].propertyid).append(template.replace("{{endtime}}",endtime);
		        		}
		        		$compile($element.contents())($scope);
				    });
		        });;
		    });
	}])
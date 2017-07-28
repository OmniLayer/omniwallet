angular.module("omniControllers")
	.controller("ExplorerCrowdsalesController",["$scope", "PropertyManager", "$timeout","$http","$templateCache","$element","$compile",
		function ExplorerCrowdsalesController($scope, PropertyManager, $timeout, $http, $templateCache, $element, $compile){
		    $scope.crowdsales = [];

		    $scope.setEcosystem = function(ecosystem){
			  	$scope.ecosystem=ecosystem;
			    PropertyManager.getActiveCrowdsales($scope.ecosystem).then(function(result){
			        $scope.crowdsales=result.data.crowdsales;
			        $scope.crowdsales.forEach(function(crowdsale){
			        	PropertyManager.getProperty(crowdsale.propertyiddesired).then(function(result){
					        crowdsale.propertydesiredName = result.data.name;
					    });
			        })
			        if($scope.crowdsales.length>0)
				        $timeout(function (){
				        	return $http.get("/views/assets/partials/timer_remaining.html", {cache: $templateCache}).success(function(template) {
					            for (var i = 0; i < $scope.crowdsales.length; i++) {
				        			var endTime = $scope.crowdsales[i].deadline;
				              		$element.find('#timerWrapper-'+$scope.crowdsales[i].propertyid).append(template.replace("{{endtime}}",endTime));
				        		}
				        		$compile($element.contents())($scope);
						    });
				        });;
			    });
			}
			
			$scope.setEcosystem(1);
	}])
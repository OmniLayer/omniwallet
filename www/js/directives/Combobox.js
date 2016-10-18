angular.module("omniDirectives")
	.directive('combobox', function(){
	  return {
	    restrict:'E',
	    templateUrl:'/views/directives/combobox/combobox.html',
	    scope:{
	      optionList: '=',
	      modelValue:'=',
	      label:'@',
	      placeholder:'@',
	      valueSelected:'&'
	    },
	    controller:function($scope){
	      $scope.filteredList = $scope.optionList;
	      $scope.selectedOption=false;
	      
	      $scope.filter=function(){
	        var results = $scope.optionList.filter(function(option){
	          var matcher = new RegExp("^"+$scope.modelValue);
		  if ( typeof option == "string") {
		    return matcher.test(option);
		  } else {
		    return matcher.test(option.displayname);
		  };
	        }) ;
	        $scope.filteredList =  results.length > 0 ? results: ["No results"];

	        //$scope.valueSelected({category:$scope.modelValue});
	      };
	      
	      $scope.$watch(function(){ return $scope.optionList; },function(options){
	        $scope.filteredList = options.length > 0 ? options : ["No results"];
	      });
	      
	      
	    },
	    link: function(scope, element, attr){
	      scope.open = function(){
	        $('ul',element).css({
	          "max-height": 150,
	          "overflow-y": "auto",
	          "overflow-x": "hidden",
	          "width":$('input',element).outerWidth(),
	          "left":$('.input-group-addon',element).outerWidth()
	        });
	        $('.dropdown',element).addClass('open');
	      };
	      
	      scope.close = function(){
	        if(!scope.selectedOption)
	          $('.dropdown',element).removeClass('open');
	      };

	      scope.optionSelected = function(option){
                console.log(option);
	        scope.modelValue = option;
	        $('.dropdown',element).removeClass('open');
                if ( typeof option == "string" ) {
	          scope.valueSelected({category:option});
                } else {
	          scope.valueSelected({base:option});
		};
	        scope.selectedOption=false;
	      };
	      
	      element.on('mousedown','a',function(){
	        scope.selectedOption = true;
	      });
	    }
	  };
	})

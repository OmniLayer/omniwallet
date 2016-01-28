angular.module("omniFilters")
	.filter("toWhole",["WHOLE_UNIT", function(WHOLE_UNIT) {
		  return function(input, isDivisible) {
		  	if(input == 'None') input = 0;
		    if(isDivisible){
    		    input = input || 0;
    		    var out = new Big(input);
    		    
    		    return out.times(WHOLE_UNIT).valueOf();
		    }
		    return input;
		  };
		}])
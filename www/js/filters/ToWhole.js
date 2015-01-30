angular.module("omniFilters")
	.filter("toWhole",["WHOLE_UNIT", function(WHOLE_UNIT) {
		  return function(input) {
		    input = input || 0;
		    var out = new Big(input);
		    
		    return out.times(WHOLE_UNIT).valueOf();
		  };
		}])
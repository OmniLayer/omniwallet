angular.module("omniFilters")
	.filter("timeAgo",["$translate", function($translate) {
		  return function(blocktime) {
		      var time = new Date(blocktime * 1000);
		      var now = new Date();
		      var off = (now.getTime() / 1000) - blocktime;
		      var translations = $translate.instant(['TIMEAGO_NOW','TIMEAGO_MINUTE','TIMEAGO_HOUR','TIMEAGO_DAY','TIMEAGO_WEEK','TIMEAGO_MONTH','TIMEAGO_YEAR',])
	      
		      if (off < 60)
		        return translations.TIMEAGO_NOW;
		      else if (off < 3600)
		        return Math.round(off / 60) + ' ' + translations.TIMEAGO_MINUTE;
		      else if (off < 86400)
		        return Math.round(off / 3600) + ' ' + translations.TIMEAGO_HOUR;
		      else if (off < 604800)
		        return Math.round(off / 86400) + ' ' + translations.TIMEAGO_DAY;
		      else if (off < 2592000)
		        return Math.round(off / 604800) + ' ' + translations.TIMEAGO_WEEK;
		      else if (off < 31536000)
		        return Math.round(off / 2592000) + ' ' + translations.TIMEAGO_MONTH;
		      else
		        return Math.round(off / 31536000) + ' ' + translations.TIMEAGO_YEAR;	
		    
		  };
		}])
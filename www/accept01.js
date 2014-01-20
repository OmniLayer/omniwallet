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
    
    $scope.$on('handlePagesBroadcast', function(event, args) {
        $scope.numberOfPages = Number(args.message);
        $scope.showPages = Math.min(5, $scope.numberOfPages);
        $scope.pages = $scope.pagesCreator($scope.currentPageStart);
    });
    
    $scope.getData = function ($i) {
        // Clear scope members
        $scope.currentPageStart = (1+$i-($i%$scope.showPages));
        if ($scope.currentPageStart>$i)
            $scope.currentPageStart-=$scope.showPages;
        if ($scope.currentPageStart+$scope.showPages>$scope.numberOfPages)
            $scope.currentPageStart=$scope.numberOfPages-$scope.showPages+1;
        $scope.currentPage=$i;
        $scope.transactions = {};
        $scope.caption = 'Latest Mastercoin transactions';
	// parse currency from url parameters
	var myURLParams = BTCUtils.getQueryStringArgs();
	var num=str_pad($i, 4, '0', 'STR_PAD_LEFT');
	//var file =  'general/' + myURLParams['currency'] + '_'+myURLParams['page']+'.json';
	var file =  'general/' + myURLParams['currency'] + '_accept_' + num + '.json';
        // Make the http request and process the result
	    $http.get(
	   file,
		 {
		   
		 }).success(function (data, status, headers, config) {
			angular.forEach(data, function(item) {
		         item.source = num;
	    		});
		 	$scope.transactions = data;
		});
		 $scope.initPages($scope.currentPageStart);
	}
$scope.initPages = function($n) {
    	$scope.pages = $scope.pagesCreator($n);
    }
    
    
    $scope.prevPages = function() {
        if ($scope.prevClass=='') {
            $scope.currentPageStart=$scope.currentPageStart-$scope.showPages;
            if ($scope.currentPageStart<1) {
                $scope.currentPageStart=1;
            }
            $scope.pages = $scope.pagesCreator($scope.currentPageStart);
        }
    }
    
    $scope.nextPages = function() {
        if ($scope.nextClass=='') {
            $scope.currentPageStart=$scope.showPages+$scope.currentPageStart;
            if ($scope.currentPageStart>$scope.numberOfPages-$scope.showPages+1) {
                $scope.currentPageStart=$scope.numberOfPages-$scope.showPages+1;
            }
            $scope.pages = $scope.pagesCreator($scope.currentPageStart);
        }
    }
    
    $scope.partToggle = function($i) {
        var num=str_pad($i, 4, '0', 'STR_PAD_LEFT');
        var startIndex = $scope.findFirstIndex(num);
     	if (startIndex == -1){
	    var myURLParams = BTCUtils.getQueryStringArgs();
	    var file =  'general/' + myURLParams['currency'] + '_' + num + '.json';
            $http.get(file).success(function (data, status, headers, config) {
                angular.forEach(data, function(item) {
                              item.source = num;
                     });
                $scope.transactions = $scope.transactions.concat(data);
                $scope.pages[$i-$scope.currentPageStart]["img"] = "remove";
                $scope.pages[$i-$scope.currentPageStart]["class"] = "selected";
             });
        }else{
            $scope.transactions.splice(startIndex, 10);
            $scope.pages[$i-$scope.currentPageStart]["img"] = "add";
                $scope.pages[$i-$scope.currentPageStart]["class"] = "";
        }
     }
     
     $scope.pagesCreator = function(start){
        var to_show= new Array();
    	for (var i = 0; i < $scope.showPages && i+start <=$scope.numberOfPages && i+start>0; i++) {
    		to_show[i] = {};
    		to_show[i]["number"] = start+i;
                if($scope.findFirstIndex(str_pad(i+start, 4, '0', 'STR_PAD_LEFT'))== -1  && start+i!=$scope.currentPage ){
                    to_show[i]["img"] = "add";
                    to_show[i]["class"] = "";
                }else{
                    to_show[i]["img"] = "remove";
                    to_show[i]["class"] = "selected";
                    $scope.firstLoad=false;
                }
    	}
        if (start>1) {
            $scope.prevClass='';
        }else{
            $scope.prevClass='disabled';
        }
        
        if ($scope.currentPageStart+$scope.showPages<=$scope.numberOfPages) {
            $scope.nextClass='';
        }else{
            $scope.nextClass='disabled';
        }
        return to_show;
     }
     
     $scope.findFirstIndex = function(itemSource) {
        for(var i = 0; i < $scope.transactions.length; i++) {
                if ($scope.transactions[i].source == itemSource) {
                        return i;
                }
        }
        return -1; // not found
     }
}

function str_pad (input, pad_length, pad_string, pad_type) {
  var half = '',
    pad_to_go;

  var str_pad_repeater = function (s, len) {
    var collect = '',
      i;

    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);

    return collect;
  };

  input += '';
  pad_string = pad_string !== undefined ? pad_string : ' ';

  if (pad_type !== 'STR_PAD_LEFT' && pad_type !== 'STR_PAD_RIGHT' && pad_type !== 'STR_PAD_BOTH') {
    pad_type = 'STR_PAD_RIGHT';
  }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type === 'STR_PAD_LEFT') {
      input = str_pad_repeater(pad_string, pad_to_go) + input;
    } else if (pad_type === 'STR_PAD_RIGHT') {
      input = input + str_pad_repeater(pad_string, pad_to_go);
    } else if (pad_type === 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
      input = half + input + half;
      input = input.substr(0, pad_length);
    }
  }

  return input;
}

$(document).ready(function () {
    SearchHistoryContext.initHistoryCombobox();


    //Add padding to the body
    var navHeight = $('.navbar').height();
    $('.page-container').css('paddingTop', navHeight + 20);
    console.log('CHanged padding of body');


    $('#btnSearch').click(function () {

        SearchHistoryContext.addSearchToHistory();


        //redirect to Search.html?tx=<searched term>
        var searchTerm = $('.combobox-container .select').val();

        window.location.href = "Search.html?tx=" + searchTerm;

    });
});

SearchHistoryContext = new function () {
};

SearchHistoryContext.initHistoryCombobox = function () {
    if (SearchHistoryContext.supportsStorage()) {

        console.log(localStorage["Search"]);
        if (localStorage["Search"]) {

            var addresses = localStorage["Search"];
            var history = JSON.parse(addresses);

            console.log(history);

            //if there is something in history add to combobox
            var showValuesInCombobox = history.reverse();
            $.each(showValuesInCombobox, function (key, value) {

                console.log(key);
                console.log(value);

                $('#searchText')
                    .append($("<option></option>")
                    .attr("value", value)
                    .text(value));

            });

        }
        $("#searchText").combobox();


        //Add button in here

        $('.search .combobox-container').append($("<button id='btnSearch' class='btn btn-default'></button>")
                    .text('Search'));

        //Placeholder
        $('.search .combobox-container .customDropdown').attr("placeholder", "Address or Transaction");

    }
    else {
        //Doesn't support storage, do nothing
    }
};

SearchHistoryContext.supportsStorage = function () {
    try {
        return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

SearchHistoryContext.addSearchToHistory = function () {
    if (SearchHistoryContext.supportsStorage()) {

        // var address = $("input.select.optional.form-control.form-control30px.combobox").val();
        var search = $('.combobox-container .select').val();

        console.log(search);

        var history;
        if (localStorage["Search"]) {
            history = JSON.parse(localStorage["Search"]);
            if (history.length > 9) {
                history.shift();
            }
          
            var index = history.indexOf(search);
            if (index > -1) {
                history.splice(index, 1);
            }

            history.push(search);

            localStorage["Search"] = JSON.stringify(history);
        }
        else { 
            var que = [];
            que.push(search);
            localStorage["Search"] = JSON.stringify(que);
        }

    }
};


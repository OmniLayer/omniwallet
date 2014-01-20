$(document).ready(function () {

    var myURLParams = BTCUtils.getQueryStringArgs();
    console.log(myURLParams);


    var tx = myURLParams['tx'];
    var currency = myURLParams['currency'];
    var url = '';
    if (tx.length < 63)
    {
    	url = "Address.html?addr=" + tx;
    	window.location = url;
    	return;
    }


    //Ajax call so I can see transactionType from JSON
    url = '/tx/' + tx + '.json';
    $.ajax({
	url: url,
	type: 'get',
	success: function (data) {
	    //successfull callback, forward user to original_url
	    //  window.location = url;
	    var url = "";

	    var response = data;
	    console.log(response);
	    console.log(response[0].transactionType);
	    var transactionType = response[0].transactionType;
	    var method = response[0].method;
	    var invalid = response[0].invalid;
	    var invalid_str = invalid.toString();
	    if (invalid_str == 'true,bitcoin payment') {
                //if is bitcoin payment
		url += "btcpayment.html?tx=";
            }
	    else if ((method == 'basic') || (transactionType == '00000000')) {
		//it is simplesend
		url += "simplesend.html?tx=";
	    }
	    else if (transactionType == '00000014') {
		//it is a sell offer
		url += "selloffer.html?tx=";
	    }
	    else if (transactionType == '00000016') {
		//it is a sell accept
		url += "sellaccept.html?tx=";
	    }

	    url += tx + "&currency=" + currency;

	    console.log(url);
	    window.location = url;
	},
	error: function () {
	    console.log('Error');
	}
    });
});

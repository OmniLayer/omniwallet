var initialAmount = 0;
function AcceptOfferController($scope, $http) {
    $scope.transactionInformation;
 
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";

    $scope.step = 0.1;
    $scope.amount;
    $scope.price;
    $scope.min_buyer_fee = 0.0005;
    $scope.fee = 0.0005;
    $scope.blocks = 10;
    $scope.key = "";
    $scope.currency = "";

    $scope.keyChange = function () {

        if ($scope.key != "") {
            $('#reSign').attr('disabled', false);
        }
        else {
            $('#reSign').attr('disabled', true);
        }
    };

    $scope.getSellofferData = function () {

        // parse tx from url parameters
        var myURLParams = BTCUtils.getQueryStringArgs();
        //var file = 'tx/' + myURLParams['tx'] + '.json';
	$scope.currency = myURLParams['currency'];
	
	$scope.toAddrReadOnly = ($scope.toAddress && $scope.toAddress.length > 0);
	if (myURLParams['fee'])
		$scope.fee = parseFloat(myURLParams['fee']);
	if (myURLParams['amount'])
		$scope.amount = parseFloat(myURLParams['amount']);
	if (myURLParams['price'])
		$scope.price = parseFloat(myURLParams['price']);
      
    }

    $scope.comboBoxValueChange = function () {
        console.log($scope.transactionInformation);
    }

    $scope.AmountChanged = function () {
        $('#amountWarning').hide();
    }
    
    $('.invalidKey').hide();
}







//class for Context
BTNClientContext = new function () {
};
//class for Signing
BTNClientContext.Signing = new function () {
};

BTNClientContext.Signing.Transaction = "";

BTNClientContext.Signing.ConvertRaw = function (jsonTransaction) {

    //var str = BTNClientContext.Signing.Transaction;
    var str = jsonTransaction;
    str = str.replace(/[^0-9a-fA-f]/g, '');
    var bytes = Crypto.util.hexToBytes(str);
    var sendTx = BTNClientContext.Signing.deserialize(bytes);
    var text = BTNClientContext.toBBE(sendTx);

    return text;
}

BTNClientContext.Signing.ConvertJSON = function (signedTransaction) {

    try {
        $('.invalidTransaction').hide();
        var sendTx = BTNClientContext.fromBBE(signedTransaction);

    }
    catch (e) {
        $('.invalidTransaction').show();
    }


    var rawTx = Crypto.util.bytesToHex(sendTx.serialize());

    return rawTx;
};


BTNClientContext.Signing.Verify = function () {
    console.log("verify function");
    var from_addr = $("input.select.optional.form-control.form-control30px.combobox").val();

var dataToSend = { addr: from_addr };

var ok = true;
$.post('/wallet/validateaddr/', dataToSend, function (data) {
console.log('success');
console.log(data);

if (data.status == 'OK') {
    ok = true;
    $('#verifyMessage').addClass('greenText');
    $('#verifyMessage').text('OK');
    $('#verifyMessage').show();
    BTNClientContext.Resize();
    return ok;
}
else {
    $('#verifyMessage').addClass('greenText');
    ok = false;
    if (data.status == 'invalid pubkey') {
        $('#verifyMessage').text('invalid pubkey');
    } else {
        if (data.status == 'missing pubkey') {
            $('#verifyMessage').text('no pubkey on blockchain');
        } else {
	        $('#verifyMessage').addClass('redText');
            if (data.status == 'invalid address') {
                $('#verifyMessage').text('invalid address');
            } else {
                $('#verifyMessage').text('invalid');
            }
        }
    }
}
$('#verifyMessage').show();
BTNClientContext.Resize();
return ok;
}).fail(function () {

console.log('fail');
$('#verifyMessage').text('ping?');
$('#verifyMessage').addClass('redText');

ok = false;

$('#verifyMessage').show();
BTNClientContext.Resize();
return ok;
});



};

BTNClientContext.Signing.SingSource = function () {
var hashType = 1;

//Source Script for signing
var sourceScript = [];
var sourceScriptString = $('#sourceScript').val().split(';');
$.each(sourceScriptString, function (i, val) {
sourceScript[i] = new BTNClientContext.parseScript(val);
console.log(val);
console.log($.toJSON(sourceScript[i]));
console.log(BTNClientContext.dumpScript(sourceScript[i]));
});

//create transaction object from BBE JSON
// var transactionBBE = $('#transactionBBE').val();
var transactionBBE = BTNClientContext.Signing.ConvertRaw(BTNClientContext.Signing.Transaction);

try {
$('.invalidTransaction').hide();
    var sendTx = BTNClientContext.fromBBE(transactionBBE);
}
catch (e) {
    $('.invalidTransaction').show();
    return;
}

//signature section
var eckey = BTNClientContext.GetEckey($('#privateKey').val()); //ECDSA
console.log($('#privateKey').val());
console.log(Crypto.util.bytesToHex(eckey.getPubKeyHash()));
for (var i = 0; i < sendTx.ins.length; i++) { //for each input in the transaction -- sign it with the Key

//console.log($.toJSON(sendTx));
//console.log($.toJSON(sourceScript[i]));

var hash = sendTx.hashTransactionForSignature(sourceScript[i], i, hashType); //Get hash of the transaction applying the soure script
console.log(Crypto.util.bytesToHex(hash));

var signature = eckey.sign(hash); //<---SIGN HERE
signature.push(parseInt(hashType, 10)); //add white space
var pubKey = eckey.getPub();			//public key

//creating new in sript signature
var script = new Bitcoin.Script();
script.writeBytes(signature);
script.writeBytes(pubKey);
//write sript signature
sendTx.ins[i].script = script;
}

return BTNClientContext.toBBE(sendTx);
};
//Should re sign transaction -- need to call all BC functions
BTNClientContext.Signing.ReSignTransaction = function () {
var reSigned = BTNClientContext.Signing.SingSource();
BTNClientContext.Signing.TransactionBBE = reSigned;

//show re-signed transaction
$('#signedTransactionBBE').val(reSigned);
BTNClientContext.Signing.RawChecked = false;
BTNClientContext.ToRawSigned();
$('#RawRadioBtnSigned').addClass('active');
$('#JsonRadioBtnSigned').removeClass('active');

//show hidden
$('#reSignClickedForm').show();
};

BTNClientContext.Signing.SendTransaction = function () {

var signedTransaction = $('#signedTransactionBBE').val();

//Maybe I need to convert to object from json string???
var sendTx = BTNClientContext.fromBBE(signedTransaction);
var rawTx = Crypto.util.bytesToHex(sendTx.serialize());
var dataToSend = { signedTransaction: rawTx };
console.log(dataToSend);

// Ajax call to /wallet/pushtx/
$.post('/wallet/pushtx/', dataToSend, function (data) {
console.log('success');
console.log(data);


}).fail(function () {

// TODO  This should be changed - Currently always fail as there is no server

});
};

BTNClientContext.Signing.GetRawTransaction = function () {


var myURLParams = BTCUtils.getQueryStringArgs();
var from_address = $("input.select.optional.form-control.form-control30px.combobox").val();
var amount = $('#amount').val();
var price = $('#price').val();
var min_buyer_fee = $('#min_buyer_fee').val();
var fee = $('#fee').val();
var blocks = $('#blocks').val();
var currency = $('#currency').val();

var dataToSend = { seller: from_address, amount: amount, price: price, min_buyer_fee: min_buyer_fee, fee: fee, blocks: blocks, currency: currency };
console.log(dataToSend);

// Ajax call to /wallet/send/
$.post('/wallet/sell/', dataToSend, function (data) {
console.log('success');
console.log(data);

BTNClientContext.Signing.GetRawTransactionResponse(data);

}).fail(function () {

// TODO This should be changed - Currently always fail as there is no server

console.log('fail');
var testResponse = {
    'sourceScript': 'ERROR',
    'transaction': ''
};
BTNClientContext.Signing.GetRawTransactionResponse(testResponse);

});
};

BTNClientContext.Signing.GetRawTransactionResponse = function (data) {


BTNClientContext.Signing.Transaction = data.transaction;

//Init fields values
//data should have fields sourceScript and transaction
$('#sourceScript').val(data.sourceScript);
$('#transactionBBE').val(data.transaction);

//Showing the fields
$('#createRawResponseForm').show();

};



// HISTORY of Buyer address or public key

BTNClientContext.Signing.supportsStorage = function () {
try {
return 'localStorage' in window && window['localStorage'] !== null;
    } catch (e) {
        return false;
    }
};

BTNClientContext.Signing.initHistoryCombobox = function () {
    var myURLParams = BTCUtils.getQueryStringArgs();
    var useAddress = myURLParams['from'];

    var showValuesInCombobox = Wallet.GetAddressesOfFirstWallet();
    
    if (useAddress) {
        if (showValuesInCombobox.indexOf(useAddress) == -1) {
    	    showValuesInCombobox.splice(0, 0, useAddress);
        }
    }
    
    $.each(showValuesInCombobox, function (key, value) {

	console.log(key);
	console.log(value);

	$('#fromAddressOrPublicKey')
	.append($("<option></option>")
	.attr("value", value)
	.text(value));

	//.attr("value", value.address)
	//    .text(value.address));
    });
    
    if (useAddress) {
        $("#fromAddressOrPublicKey").val(useAddress);
    }
    
    $("#fromAddressOrPublicKey").combobox();
};

BTNClientContext.Signing.addAddressToHistory = function () {
    if (BTNClientContext.Signing.supportsStorage()) {

        var address = $("input.select.optional.form-control.form-control30px.combobox").val();
        var history;
        if (localStorage["Addresses"]) {
            history = JSON.parse(localStorage["Addresses"]);
            if (history.length > 9) {
                history.shift();
            }
            var addr = { 'address': address };

            // Check if the addr is in the array already and if it is delete it
           // var index = history.indexOf(addr);
            var index = history.indexOf(address);
            if (index > -1) {
                history.splice(index, 1);
            }

            //add new address to array
            //  history.push(addr);
            history.push(address);

            localStorage["Addresses"] = JSON.stringify(history);
        }
        else { // If the localStorage["Addresses"] doesn't exists
         //   var addr = { 'address': address };
            var que = [];
            // que.push(addr);
            que.push(address);
            localStorage["Addresses"] = JSON.stringify(que);
        }

       // console.log(localStorage["Addresses"]);
    }
};
$(document).ready(function myfunction() {
    $('#sendLoader').addClass('hideLoader');
 
    //Combbox init
    BTNClientContext.Signing.initHistoryCombobox();



    BTNClientContext.Resize();


    var navHeight = $('.navbar').height();
    $('.page-container').css('paddingTop', navHeight + 20);


    //disable btn at the beggining, because it needs to have a value in a privateKey
    $('#reSign').attr('disabled', true);


    $('#createRawTransaction').click(function () {
        $('#createRawTransactionLoader').show();

        BTNClientContext.Signing.GetRawTransaction();


        //Add address to history
        BTNClientContext.Signing.addAddressToHistory();

        $('#createRawTransactionLoader').hide();
    });

     $('#reSign').click(function () {
    
            $('.invalidKey').hide();
            $('.invalidTransaction').hide();
    
            $('#reSignLoader').show();
            try {
                BTNClientContext.Signing.ReSignTransaction();
            }
            catch (e) {
                console.log(e);
                $('.invalidKey').show();
                $('.invalidTransaction').show();
    
    
                //If the key is invalid the resigned transaction form is hidden again
                $('#reSignClickedForm').hide();
    
            }
            $('#reSignLoader').hide();
    });

    $('#send').click(function () {

        $('#sendLoader').addClass('showUntilAjax');
        $('#sendLoader').addClass('show3sec');
        var sendLoaderInterval = setInterval(function () {
           $('#sendLoader').removeClass('show3sec');
           clearInterval(sendLoaderInterval);
        }, 3000);

        //BTNClientContext.Signing.SendTransaction();
        BTNClientContext.txSend();

    });

    $('#verifyButton').click(function () {
        $('#verifyMessage').hide();
        $('#verifyLoader').show();

        //If returned ok then add address to history
        if (BTNClientContext.Signing.Verify()) {
            BTNClientContext.Signing.addAddressToHistory();

            console.log('added to history');
        }
        else {
            console.log('not verified and not ok');
        }

        $('#verifyLoader').hide();
    });

    //$("#rawJsonRadio").click(function () {
    
        //    console.log(BTNClientContext.Signing.Transaction);
        //    var converted = "";
        //    if ($('#RawRadioBtn').hasClass('active')) { //It raw has class active it means that the json state is selected now
        //        converted = BTNClientContext.Signing.ConvertRaw();
        //    }
        //    else { //the raw state is selected now
        //        converted = BTNClientContext.Signing.Transaction;
        //    }
    
        //    $('#transactionBBE').val(converted);
        //});
        $('#JsonRadioBtn').click(function () {
            var converted = BTNClientContext.Signing.ConvertRaw(BTNClientContext.Signing.Transaction);
            $('#transactionBBE').val(converted);
        });
        $('#RawRadioBtn').click(function () {
            var converted = BTNClientContext.Signing.Transaction;
            $('#transactionBBE').val(converted);
        });
    
    
        $('#JsonRadioBtnSigned').click(function () {
            if (BTNClientContext.Signing.RawChecked == true) {
            	var rawTransaction = $('#signedTransactionBBE').val();
    		var converted = BTNClientContext.Signing.ConvertRaw(rawTransaction);
            	$('#signedTransactionBBE').val(converted);
                $('#signedTransactionBBE').attr('readonly', false);
                BTNClientContext.Signing.RawChecked = false;
            }
        });
    
        BTNClientContext.Signing.RawChecked = true;
        $('#RawRadioBtnSigned').click(function () {
            BTNClientContext.ToRawSigned();
            if ($('.invalidTransaction').is(":visible")) {
                console.log('Json is invalid');
                $('#RawRadioBtnSigned').removeClass('active');
                $('#JsonRadioBtnSigned').addClass('active');
    
            }
        });
    
});

BTNClientContext.ToRawSigned = function() {
	if (BTNClientContext.Signing.RawChecked == false) {
		var converted = "";
		try {
		    var signedTransaction = $('#signedTransactionBBE').val();
		    converted = BTNClientContext.Signing.ConvertJSON(signedTransaction);
		    $('#signedTransactionBBE').attr('readonly', false);
		    BTNClientContext.Signing.RawChecked = true;
		}
		catch (e) {
		    converted = $('#signedTransactionBBE').val();

		    $('#RawRadioBtnSigned').removeClass('active');
		    $('#JsonRadioBtnSigned').addClass('active');


		}
		$('#signedTransactionBBE').val(converted);
	}
}

BTNClientContext.Resize = function () {
    // console.log($('#amount').width());
    var width = $('#amount').width() - 25;

    var left = $('#verifyButton').offset().left + 70;
    //  console.log(left);
    $('#verifyMessage').width(width);
    $('#verifyMessage').offset({ left: left });
};

$(window).resize(function () {
    BTNClientContext.Resize();
});

function txSent(text) {
alert(text ? text : 'No response!');
}

BTNClientContext.txSend = function() {
        $('#sendHyperlink').hide();
        $('#sendMessage').hide();
        BTNClientContext.ToRawSigned();
	$('#RawRadioBtnSigned').addClass('active');
	$('#JsonRadioBtnSigned').removeClass('active');
        
        var rawTx = $('#signedTransactionBBE').val();
	//var sendTx = BTNClientContext.fromBBE(signedTransaction);
	//var rawTx = Crypto.util.bytesToHex(sendTx.serialize());

        //url = 'http://bitsend.rowit.co.uk/?transaction=' + tx;
        url = 'http://blockchain.info/pushtx';
        postdata = 'tx=' + rawTx;

        if (url != null && url != "") {
            BTNClientContext.tx_fetch(url, txSent, txSent, postdata);
        }
        return false;
}

// Some cross-domain magic (to bypass Access-Control-Allow-Origin)
BTNClientContext.tx_fetch = function(url, onSuccess, onError, postdata) {
    var useYQL = true;

    if (useYQL) {
        var q = 'select * from html where url="'+url+'"';
        if (postdata) {
            q = 'use "https://dev.masterchain.info/js/htmlpost.xml" as htmlpost; ';
            q += 'select * from htmlpost where url="' + url + '" ';
            q += 'and postdata="' + postdata + '" and xpath="//p"';
        }
        url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(q);
    }

    $.ajax({
        url: url,
        success: function(res) {
            $('#sendLoader').removeClass('showUntilAjax');
           
            $('#sendMessage').text('Transaction sent');
            $('#sendMessage').addClass('greenTextColor');
            $('#sendMessage').show();

            //Get transaction hash code
            var link = "https://blockchain.info/tx/";
            //signed transaction code
            var code = JSON.parse(BTNClientContext.Signing.TransactionBBE).hash;

            link += code;
            $('#sendLink').attr('href', link);
            $('#sendLink').text(link);
            $('#sendHyperlink').show();            
        },
        error:function (xhr, opt, err) {
            $('#sendMessage').text('Transaction send error');
            $('#sendMessage').addClass('redText');
            $('#sendMessage').show();
            $('#sendLoader').removeClass('showUntilAjax');             
        }
    });
}


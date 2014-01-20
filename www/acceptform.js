var initialAmount = 0;
function AcceptOfferController($scope, $http) {
    $scope.transactionInformation;
 
    $scope.footer = "FOOTER";
    $scope.title = "TITLE";

    $scope.step = 3;

    $scope.key = "";

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
        var file = 'tx/' + myURLParams['tx'] + '.json';

        // Make the http request and process the result

        $http.get(file, {}).success(function (data, status, headers, config) {
            $scope.transactionInformation = data[0];

            $scope.transactionInformation.formatted_amount = parseFloat($scope.transactionInformation.formatted_amount);
            initialAmount = $scope.transactionInformation.formatted_amount;

            $scope.transactionInformation.to_address = 11;
            //Create step for input type number
            var amount = $scope.transactionInformation.formatted_amount.toString();
            //Whole number
            if (amount.indexOf(".") == -1) {
                console.log('Whole number');
                $scope.step = "1";
            }
            else {//Decimal number
                var decimalN = amount.substr(amount.indexOf(".") + 1);
                var step = "0.";
                for (var i = 0; i < decimalN.length - 1; i++) {
                    step += "0";
                }
                step += "1";
                $scope.step = step;
            }
        });
      
    }

    $scope.comboBoxValueChange = function () {
        //console.log($scope.transactionInformation);
    }

    $scope.AmountChanged = function () {
        $('#amountWarning').hide();
        if (initialAmount < $scope.transactionInformation.formatted_amount) {
            // Amount higher than offer - Should tell the user that 
            console.log("blue warning");
            $('#amountWarning').show();
        }
    }
}


//class for Context
BTNClientContext = new function () {
};
//class for Signing
BTNClientContext.Signing = new function () {
};

BTNClientContext.Signing.Transaction = "";

BTNClientContext.Signing.ConvertRaw = function () {

    var str = BTNClientContext.Signing.Transaction;
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
    var buyer = $("input.select.optional.form-control.form-control30px.combobox").val();

var dataToSend = { addr: buyer };

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
    //Add address to history
    BTNClientContext.Signing.addAddressToHistory();
    return ok;
}
else {
    $('#verifyMessage').addClass('redText');
    ok = false;
    if (data.status == 'invalid pubkey') {
        $('#verifyMessage').text('invalid pubkey');
    } else {
        if (data.status == 'missing pubkey') {
            $('#verifyMessage').text('no pubkey on blockchain');
        } else {
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
var transactionBBE = BTNClientContext.Signing.ConvertRaw();
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

//show hidden
$('#reSignClickedForm').show();
};

BTNClientContext.Signing.SendTransaction = function () {

var signedTransaction = $('#signedTransactionBBE').val();

//Maybe I need to convert to object from json string???

var dataToSend = { signedTransaction: signedTransaction };
console.log(dataToSend);

// Ajax call to /wallet/signed/
$.post('/wallet/signed/', dataToSend, function (data) {
console.log('success');
console.log(data);


}).fail(function () {

// TODO  This should be changed - Currently always fail as there is no server

});
};

BTNClientContext.Signing.GetRawTransaction = function () {


var myURLParams = BTCUtils.getQueryStringArgs();
var tx_hash = myURLParams['tx'];
var amount = $('#amount').val();
var buyer = $('#buyerAddressOrPublicKey').val();

var dataToSend = { buyer: buyer, amount: amount, tx_hash: tx_hash };
console.log(dataToSend);

// Ajax call to /wallet/accept/
$.post('/wallet/accept/', dataToSend, function (data) {
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
    if (BTNClientContext.Signing.supportsStorage()) {

        console.log(localStorage["Addresses"]);
        if (localStorage["Addresses"]) {

            var addresses = localStorage["Addresses"];
            var history = JSON.parse(addresses);

            console.log(history);

            // if there is something in history add to combobox
            var showValuesInCombobox = history.reverse();
            $.each(showValuesInCombobox, function (key, value) {

                console.log(key);
                console.log(value);

                $('#buyerAddressOrPublicKey')
                    .append($("<option></option>")
                    .attr("value", value)
                    .text(value));

                //.attr("value", value.address)
                //    .text(value.address));
            });
        }

        $("#buyerAddressOrPublicKey").combobox();


    }
    else {
        //Doesn't support storage, do nothing
    }
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
        $('#sendLoader').show();

        BTNClientContext.Signing.SendTransaction();

        $('#sendLoader').hide();
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
        var converted = BTNClientContext.Signing.ConvertRaw();
        $('#transactionBBE').val(converted);
    });
    $('#RawRadioBtn').click(function () {
        var converted = BTNClientContext.Signing.Transaction;
        $('#transactionBBE').val(converted);
    });


    $('#JsonRadioBtnSigned').click(function () {
        if (BTNClientContext.Signing.RawChecked == true) {

            $('#signedTransactionBBE').attr('readonly', false);
            console.log('JSON');
            var converted = BTNClientContext.Signing.TransactionBBE;
            $('#signedTransactionBBE').val(converted);
            BTNClientContext.Signing.RawChecked = false;
        }
    });

    BTNClientContext.Signing.RawChecked = false;
    $('#RawRadioBtnSigned').click(function () {
        if (BTNClientContext.Signing.RawChecked == false) {
            var converted = "";
            try {
                var signedTransaction = $('#signedTransactionBBE').val();
                converted = BTNClientContext.Signing.ConvertJSON(signedTransaction);
                $('#signedTransactionBBE').attr('readonly', true);
                BTNClientContext.Signing.RawChecked = true;
            }
            catch (e) {
                converted = $('#signedTransactionBBE').val();

                $('#RawRadioBtnSigned').removeClass('active');
                $('#JsonRadioBtnSigned').addClass('active');

              
            }
            $('#signedTransactionBBE').val(converted);
        }
        if ($('.invalidTransaction').is(":visible")) {
            console.log('Json is invalid');
            $('#RawRadioBtnSigned').removeClass('active');
            $('#JsonRadioBtnSigned').addClass('active');

        }
    });

});

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

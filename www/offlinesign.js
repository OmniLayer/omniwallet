
OfflineSign = function () {

};
OfflineSign.Signing = function () {

};
OfflineSign.Signing.ConvertRaw = function (str) {

    // var str = $('#transactionBBE').val();

    console.log(str);

    str = str.replace(/[^0-9a-fA-f]/g, '');
    var bytes = Crypto.util.hexToBytes(str);
    var sendTx = BTNClientContext.Signing.deserialize(bytes);
    var text = BTNClientContext.toBBE(sendTx);

    return text;
};

OfflineSign.Signing.ConvertJSON = function (signedTransaction) {
    console.log(signedTransaction);
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


OfflineSign.Signing.SingSource = function () {
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
    var transactionBBE = "";
    if ($('#OfflineRawRadioBtn').hasClass('active')) {

        transactionBBE = OfflineSign.Signing.ConvertRaw($('#transactionBBE').val());
    }
    else {
        transactionBBE = $('#transactionBBE').val();
    }
    try {
        $('.invalidTransaction').hide();
        var sendTx = BTNClientContext.fromBBE(transactionBBE);
    }
    catch (e) {
        $('.invalidTransaction').show();
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

OfflineSign.Signing.ReSignTransaction = function () {


    var reSigned = OfflineSign.Signing.SingSource();

    //show re-signed transaction
    $('#signedTransactionBBE').val(reSigned);
    
    OfflineSign.Signing.RawChecked = false;
    OfflineSign.ToRawSigned();
    
    //show hidden
    $('#reSignClickedForm').show();
};

OfflineSign.ToRawSigned = function() {
	if (OfflineSign.Signing.RawChecked == false) {
		var converted = "";
		try {
		    var signedTransaction = $('#signedTransactionBBE').val();
		    converted = OfflineSign.Signing.ConvertJSON(signedTransaction);
		    $('#signedTransactionBBE').attr('readonly', false);
		    OfflineSign.Signing.RawChecked = true;
		}
		catch (e) {
		    converted = $('#signedTransactionBBE').val();

		    $('#RawRadioBtnSigned').removeClass('active');
		    $('#JsonRadioBtnSigned').addClass('active');


		}
		$('#signedTransactionBBE').val(converted);
	}
}


$(document).ready(function () {

    $('#invalidKey').hide();
    $('#OfflineJsonRadioBtn').click(function () {

        var converted = OfflineSign.Signing.ConvertRaw($('#transactionBBE').val());


        $('#transactionBBE').val(converted);

        $('#transactionBBE').attr('readonly', true);
    });
    $('#OfflineRawRadioBtn').click(function () {

        var converted = OfflineSign.Signing.ConvertJSON($('#transactionBBE').val());

        $('#transactionBBE').val(converted);
        $('#transactionBBE').attr('readonly', false);

    });


    $('#JsonRadioBtnSigned').click(function () {
        if (OfflineSign.Signing.RawChecked != true)
        	return;
        try {
            console.log('JSON');
            var converted = OfflineSign.Signing.ConvertRaw($('#signedTransactionBBE').val());
            $('#signedTransactionBBE').val(converted);
            OfflineSign.Signing.RawChecked = false;
        }
        catch (e) {
            $('#JsonRadioBtnSigned').removeClass('active');
            $('#RawRadioBtnSigned').addClass('active');

        }
    });

    $('#RawRadioBtnSigned').click(function () {

        OfflineSign.ToRawSigned();


    });




    $('#reSign').click(function () {
	$('#sendSignedMsg').hide();
        $('#invalidKey').hide();
        $('.invalidTransaction').hide();

        $('#reSignLoader').show();
        try {
            OfflineSign.Signing.ReSignTransaction();
            $('#sendSignedMsg').show();
        }
        catch (e) {
            console.log(e);
            $('#invalidKey').show();
            $('.invalidTransaction').show();

        }
        $('#reSignLoader').hide();
    });

});
/*
    tx.js - Bitcoin transactions for JavaScript (public domain)

    Obtaining inputs:
    1) http://blockchain.info/unspent?address=<address>
    2) http://blockexplorer.com/q/mytransactions/<address>

    Sending transactions:
    1) http://bitsend.rowit.co.uk
    2) http://www.blockchain.info/pushtx
*/

var TX = new function () {

    var inputs = [];
    var outputs = [];
    var eckey = null;
    var balance = 0;

    this.init = function(_eckey) {
        outputs = [];
        eckey = _eckey;
    }

    this.addOutput = function(addr, fval) {
        outputs.push({address: addr, value: fval});
    }

    this.removeOutputs = function() {
        outputs = [];
    }

    this.getBalance = function() {
        return balance;
    }

    this.getFee = function(sendTx) {
        var out = BigInteger.ZERO;
        for (var i in outputs) {
            var fval = outputs[i].value;
            value = new BigInteger('' + Math.round(fval*1e8), 10);
            out = out.add(value);
        }
        return balance.subtract(out);
    }

    this.getAddress = function(addrtype) {
        var addr = new Bitcoin.Address(eckey.getPubKeyHash());
        addr.version = addrtype ? addrtype : 0;
        return addr.toString();
    }

    this.parseInputs = function(text, address) {
        try {
            var res = tx_parseBCI(text, address);
        } catch(err) {
            var res = parseTxs(text, address);
        }

        balance = res.balance;
        inputs = res.unspenttxs;
    }

    this.rebuild = function(sendTx, resign) {
        if (!resign)
          sendTx = new Bitcoin.Transaction();

        var selectedOuts = [];
        for (var hash in inputs) {
            if (!inputs.hasOwnProperty(hash))
                continue;
            for (var index in inputs[hash]) {
                if (!inputs[hash].hasOwnProperty(index))
                    continue;
                var script = parseScript(inputs[hash][index].script);
                var b64hash = Crypto.util.bytesToBase64(Crypto.util.hexToBytes(hash));
                var txin = new Bitcoin.TransactionIn({outpoint: {hash: b64hash, index: index}, script: script, sequence: 4294967295});
                selectedOuts.push(txin);
                if (!resign)
                  sendTx.addInput(txin);
            }
        }

        for (var i in outputs) {
            var address = outputs[i].address;
            var fval = outputs[i].value;
            var value = new BigInteger('' + Math.round(fval * 1e8), 10);
            if (!resign)
              sendTx.addOutput(new Bitcoin.Address(address), value);
        }

        var hashType = 1;
        for (var i = 0; i < sendTx.ins.length; i++) {
            var connectedScript = selectedOuts[i].script;
            var hash = sendTx.hashTransactionForSignature(connectedScript, i, hashType);
            var pubKeyHash = connectedScript.simpleOutPubKeyHash();
            var signature = eckey.sign(hash);
            signature.push(parseInt(hashType, 10));
            var pubKey = eckey.getPub();
            var script = new Bitcoin.Script();
            script.writeBytes(signature);
            script.writeBytes(pubKey);
            sendTx.ins[i].script = script;
        }
        return sendTx;
    };

    this.construct = function() {
      return this.rebuild(null, false);
    }

    this.resign = function(sendTx) {
      return this.rebuild(sendTx, true);
    }

    function uint(f, size) {
        if (f.length < size)
            return 0;
        var bytes = f.slice(0, size);
        var pos = 1;
        var n = 0;
        for (var i = 0; i < size; i++) { 
            var b = f.shift();
            n += b * pos;
            pos *= 256;
        }
        return size <= 4 ? n : bytes;
    }

    function u8(f)  { return uint(f,1); }
    function u16(f) { return uint(f,2); }
    function u32(f) { return uint(f,4); }
    function u64(f) { return uint(f,8); }

    function errv(val) {
        return (val instanceof BigInteger || val > 0xffff);
    }

    function readBuffer(f, size) {
        var res = f.slice(0, size);
        for (var i = 0; i < size; i++) f.shift();
        return res;
    }

    function readString(f) {
        var len = readVarInt(f);
        if (errv(len)) return [];
        return readBuffer(f, len);
    }

    function readVarInt(f) {
        var t = u8(f);
        if (t == 0xfd) return u16(f); else
        if (t == 0xfe) return u32(f); else
        if (t == 0xff) return u64(f); else
        return t;
    }

    this.deserialize = function(bytes) {
        var sendTx = new Bitcoin.Transaction();

        var f = bytes.slice(0);
        var tx_ver = u32(f);
        var vin_sz = readVarInt(f);
        if (errv(vin_sz))
            return null;

        for (var i = 0; i < vin_sz; i++) {
            var op = readBuffer(f, 32);
            var n = u32(f);
            var script = readString(f);
            var seq = u32(f);
            var txin = new Bitcoin.TransactionIn({
                outpoint: { 
                    hash: Crypto.util.bytesToBase64(op),
                    index: n
                },
                script: new Bitcoin.Script(script),
                sequence: seq
            });
            sendTx.addInput(txin);
        }

        var vout_sz = readVarInt(f);

        if (errv(vout_sz))
            return null;

        for (var i = 0; i < vout_sz; i++) {
            var value = u64(f);
            var script = readString(f);

            var txout = new Bitcoin.TransactionOut({
                value: value,
                script: new Bitcoin.Script(script)
            });

            sendTx.addOutput(txout);
        }
        var lock_time = u32(f);
        sendTx.lock_time = lock_time;
        return sendTx;
    };

    this.toBBE = function(sendTx) {
        //serialize to Bitcoin Block Explorer format
        var buf = sendTx.serialize();
        var hash = Crypto.SHA256(Crypto.SHA256(buf, {asBytes: true}), {asBytes: true});

        var r = {};
        r['hash'] = Crypto.util.bytesToHex(hash.reverse());
        r['ver'] = sendTx.version;
        r['vin_sz'] = sendTx.ins.length;
        r['vout_sz'] = sendTx.outs.length;
        r['lock_time'] = sendTx.lock_time;
        r['size'] = buf.length;
        r['in'] = []
        r['out'] = []

        for (var i = 0; i < sendTx.ins.length; i++) {
            var txin = sendTx.ins[i];
            var hash = Crypto.util.base64ToBytes(txin.outpoint.hash);
            var n = txin.outpoint.index;
            var prev_out = {'hash': Crypto.util.bytesToHex(hash.reverse()), 'n': n};
            var seq = txin.sequence;

            if (n == 4294967295) {
                var cb = Crypto.util.bytesToHex(txin.script.buffer);
                r['in'].push({'prev_out': prev_out, 'coinbase' : cb, 'sequence':seq});
            } else {
                var ss = dumpScript(txin.script);
                r['in'].push({'prev_out': prev_out, 'scriptSig' : ss, 'sequence':seq});
            }
        }

        for (var i = 0; i < sendTx.outs.length; i++) {
            var txout = sendTx.outs[i];
            var bytes = txout.value.slice(0);
            var fval = parseFloat(Bitcoin.Util.formatValue(bytes.reverse()));
            var value = fval.toFixed(8);
            var spk = dumpScript(txout.script);
            r['out'].push({'value' : value, 'scriptPubKey': spk});
        }

        return JSON.stringify(r, null, 4);
    };

    this.fromBBE = function(text) {
        //deserialize from Bitcoin Block Explorer format
        var sendTx = new Bitcoin.Transaction();
        var r = JSON.parse(text);
        if (!r)
            return sendTx;
        var tx_ver = r['ver'];
        var vin_sz = r['vin_sz'];

        for (var i = 0; i < vin_sz; i++) {
            var txi = r['in'][i];
            var hash = Crypto.util.hexToBytes(txi['prev_out']['hash']);
            var n = txi['prev_out']['n'];

            if (txi['coinbase'])
                var script = Crypto.util.hexToBytes(txi['coinbase']);
            else
                var script = parseScript(txi['scriptSig']);

            var seq = txi['sequence'] === undefined ? 4294967295 : txi['sequence'];

            var txin = new Bitcoin.TransactionIn({
                outpoint: { 
                    hash: Crypto.util.bytesToBase64(hash.reverse()),
                    index: n
                },
                script: new Bitcoin.Script(script),
                sequence: seq
            });
            sendTx.addInput(txin);
        }

        var vout_sz = r['vout_sz'];

        TX.removeOutputs();
        for (var i = 0; i < vout_sz; i++) {
            var txo = r['out'][i];
            var fval = parseFloat(txo['value']);
            var value = new BigInteger('' + Math.round(fval * 1e8), 10);
            var script = parseScript(txo['scriptPubKey']);

            if (value instanceof BigInteger) {
                value = value.toByteArrayUnsigned().reverse();
                while (value.length < 8) value.push(0);
            }

            var txout = new Bitcoin.TransactionOut({
                value: value,
                script: new Bitcoin.Script(script)
            });

            sendTx.addOutput(txout);
            TX.addOutput(txo,fval);
        }
        sendTx.lock_time = r['lock_time'];
        return sendTx;
    };
    return this;
};

function dumpScript(script) {
    var out = [];
    for (var i = 0; i < script.chunks.length; i++) {
        var chunk = script.chunks[i];
        var op = new Bitcoin.Opcode(chunk);
        typeof chunk == 'number' ?  out.push(op.toString()) :
            out.push(Crypto.util.bytesToHex(chunk));
    }
    return out.join(' ');
}

// blockchain.info parser (adapted)
// uses http://blockchain.info/unspent?address=<address>
function tx_parseBCI(data, address) {
    var r = JSON.parse(data);
    var txs = r.unspent_outputs;

    if (!txs)
        throw 'Not a BCI format';

    delete unspenttxs;
    var unspenttxs = {};
    var balance = BigInteger.ZERO;
    for (var i in txs) {
        var o = txs[i];
        var lilendHash = o.tx_hash;

        //convert script back to BBE-compatible text
        var script = dumpScript( new Bitcoin.Script(Crypto.util.hexToBytes(o.script)) );

        var value = new BigInteger('' + o.value, 10);
        if (!(lilendHash in unspenttxs))
            unspenttxs[lilendHash] = {};
        unspenttxs[lilendHash][o.tx_output_n] = {amount: value, script: script};
        balance = balance.add(value);
    }
    return {balance:balance, unspenttxs:unspenttxs};
}

// blockexplorer parser (by BTCurious)
// uses http://blockexplorer.com/q/mytransactions/<address>
// --->8---
function parseTxs(data, address) {

    var address = address.toString();
    var tmp = JSON.parse(data);
    var txs = [];
    for (var a in tmp) {
        if (!tmp.hasOwnProperty(a))
            continue;
        txs.push(tmp[a]);
    }
    
    // Sort chronologically
    txs.sort(function(a,b) {
        if (a.time > b.time) return 1;
        else if (a.time < b.time) return -1;
        return 0;
    })

    delete unspenttxs;
    var unspenttxs = {}; // { "<hash>": { <output index>: { amount:<amount>, script:<script> }}}

    var balance = BigInteger.ZERO;

    // Enumerate the transactions 
    for (var a in txs) {
    
        if (!txs.hasOwnProperty(a))
            continue;
        var tx = txs[a];
        if (tx.ver != 1) throw "Unknown version found. Expected version 1, found version " + tx.ver;
        
        // Enumerate inputs
        for (var b in tx.in ) {
            if (!tx.in.hasOwnProperty(b))
                continue;
            var input = tx.in[b];
            var p = input.prev_out;
            var lilendHash = endian(p.hash)
            // if this came from a transaction to our address...
            if (lilendHash in unspenttxs) {
                unspenttx = unspenttxs[lilendHash];
                
                // remove from unspent transactions, and deduce the amount from the balance
                balance = balance.subtract(unspenttx[p.n].amount);
                delete unspenttx[p.n]
                if (isEmpty(unspenttx)) {
                    delete unspenttxs[lilendHash]
                }
            }
        }
        
        // Enumerate outputs
        var i = 0;
        for (var b in tx.out) {
            if (!tx.out.hasOwnProperty(b))
                continue;
                
            var output = tx.out[b];

            // if this was sent to our address...
            if (output.address == address) {
                // remember the transaction, index, amount, and script, and add the amount to the wallet balance
                var value = btcstr2bignum(output.value);
                var lilendHash = endian(tx.hash)
                if (!(lilendHash in unspenttxs))
                    unspenttxs[lilendHash] = {};
                unspenttxs[lilendHash][i] = {amount: value, script: output.scriptPubKey};
                balance = balance.add(value);
            }
            i = i + 1;
        }
    }

    return {balance:balance, unspenttxs:unspenttxs};
}

function isEmpty(ob) {
    for(var i in ob){ if(ob.hasOwnProperty(i)){return false;}}
    return true;
}

function endian(string) {
    var out = []
    for(var i = string.length; i > 0; i-=2) {
        out.push(string.substring(i-2,i));
    }
    return out.join("");
}

function btcstr2bignum(btc) {
    var i = btc.indexOf('.');
    var value = new BigInteger(btc.replace(/\./,''));
    var diff = 9 - (btc.length - i);
    if (i == -1) {
        var mul = "100000000";
    } else if (diff < 0) {
        return value.divide(new BigInteger(Math.pow(10,-1*diff).toString()));
    } else {
        var mul = Math.pow(10,diff).toString();
    }
    return value.multiply(new BigInteger(mul));
}

function parseScript(script) {
    var newScript = new Bitcoin.Script();
    var s = script.split(" ");
    for (var i in s) {
        if (Bitcoin.Opcode.map.hasOwnProperty(s[i])){
            newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
        } else {
            newScript.writeBytes(Crypto.util.hexToBytes(s[i]));
        }
    }
    return newScript;
}
// --->8---

// Some cross-domain magic (to bypass Access-Control-Allow-Origin)
function tx_fetch(url, onSuccess, onError, postdata) {
    var useYQL = true;

    if (useYQL) {
        var q = 'select * from html where url="'+url+'"';
        if (postdata) {
            q = 'use "http://brainwallet.github.com/js/htmlpost.xml" as htmlpost; ';
            q += 'select * from htmlpost where url="' + url + '" ';
            q += 'and postdata="' + postdata + '" and xpath="//p"';
        }
        url = 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(q);
    }

    $.ajax({
        url: url,
        success: function(res) {
            onSuccess(useYQL ? $(res).find('results').text() : res.responseText);
        },
        error:function (xhr, opt, err) {
            if (onError)
                onError(err);
        }
    });
}

var tx_dest = '15ArtCgi3wmpQAAfYx4riaFmo4prJA4VsK';
var tx_sec = '5KdttCmkLPPLN4oDet53FBdPxp4N1DWoGCiigd3ES9Wuknhm8uT';
var tx_addr = '12c6DSiU4Rq3P4ZxziKxzrL5LmMBrzjrJX';
var tx_unspent = '{"unspent_outputs":[{"tx_hash":"7a06ea98cd40ba2e3288262b28638cec5337c1456aaf5eedc8e9e5a20f062bdf","tx_index":5,"tx_output_n": 0,"script":"4104184f32b212815c6e522e66686324030ff7e5bf08efb21f8b00614fb7690e19131dd31304c54f37baa40db231c918106bb9fd43373e37ae31a0befc6ecaefb867ac","value": 5000000000,"value_hex": "012a05f200","confirmations":177254}]}';

function tx_test() {
    var secret = Bitcoin.Base58.decode(tx_sec).slice(1, 33);
    var eckey = new Bitcoin.ECKey(secret);
    TX.init(eckey);
    TX.parseInputs(tx_unspent, TX.getAddress());
    TX.addOutput(tx_dest, 50.0);
    var sendTx = TX.construct();
    console.log(TX.toBBE(sendTx));
    console.log(Crypto.util.bytesToHex(sendTx.serialize()));
}

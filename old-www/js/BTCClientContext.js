


BTNClientContext.parseBase58Check = function (address) {
    var bytes = Bitcoin.Base58.decode(address);
    var end = bytes.length - 4;
    var hash = bytes.slice(0, end);
    var checksum = Crypto.SHA256(Crypto.SHA256(hash, { asBytes: true }), { asBytes: true });
    if (checksum[0] != bytes[end] ||
		checksum[1] != bytes[end + 1] ||
		checksum[2] != bytes[end + 2] ||
		checksum[3] != bytes[end + 3])
        throw new Error("Wrong checksum");
    var version = hash.shift();
    return [version, hash];
}


BTNClientContext.GetEckey = function (sec) {
    var res = BTNClientContext.parseBase58Check(sec);
    var version = res[0];
    var payload = res[1];
    var compressed = false;
    if (payload.length > 32) {
        payload.pop();
        compressed = true;
    }
    var eckey = new Bitcoin.ECKey(payload);
    eckey.setCompressed(compressed);
    return eckey;
}


BTNClientContext.parseScript = function (script) {
    var newScript = new Bitcoin.Script();
    var s = script.split(" ");
    for (var i in s) {
        if (Bitcoin.Opcode.map.hasOwnProperty(s[i])) {
            newScript.writeOp(Bitcoin.Opcode.map[s[i]]);
        } else {
            newScript.writeBytes(Crypto.util.hexToBytes(s[i]));
        }
    }
    return newScript;
}
//creates string representation of the script object
BTNClientContext.dumpScript = function (script) {
    var out = [];
    for (var i = 0; i < script.chunks.length; i++) {
        var chunk = script.chunks[i];
        var op = new Bitcoin.Opcode(chunk);
        typeof chunk == 'number' ? out.push(op.toString()) :
            out.push(Crypto.util.bytesToHex(chunk));
    }
    return out.join(' ');
}

//serialize to Bitcoin Block Explorer format
BTNClientContext.toBBE = function (sendTx) {
    var buf = sendTx.serialize();
    var hash = Crypto.SHA256(Crypto.SHA256(buf, { asBytes: true }), { asBytes: true });

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
        var prev_out = { 'hash': Crypto.util.bytesToHex(hash.reverse()), 'n': n };
        var seq = txin.sequence;

        if (n == 4294967295) {
            var cb = Crypto.util.bytesToHex(txin.script.buffer);
            r['in'].push({ 'prev_out': prev_out, 'coinbase': cb, 'sequence': seq });
        } else {
            var ss = BTNClientContext.dumpScript(txin.script);
            r['in'].push({ 'prev_out': prev_out, 'scriptSig': ss, 'sequence': seq });
        }
    }

    for (var i = 0; i < sendTx.outs.length; i++) {
        var txout = sendTx.outs[i];
        var bytes = txout.value.slice(0);
        var fval = parseFloat(Bitcoin.Util.formatValue(bytes.reverse()));
        var value = fval.toFixed(8);
        var spk = BTNClientContext.dumpScript(txout.script);
        r['out'].push({ 'value': value, 'scriptPubKey': spk });
    }

    return JSON.stringify(r, null, 4);
};


//deserialize from Bitcoin Block Explorer format
BTNClientContext.fromBBE = function (text) {
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
            var script = BTNClientContext.parseScript(txi['scriptSig']);

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
    for (var i = 0; i < vout_sz; i++) {
        var txo = r['out'][i];
        var fval = parseFloat(txo['value']);
        var value = new BigInteger('' + Math.round(fval * 1e8), 10);
        var script = BTNClientContext.parseScript(txo['scriptPubKey']);

        if (value instanceof BigInteger) {
            value = value.toByteArrayUnsigned().reverse();
            while (value.length < 8) value.push(0);
        }

        var txout = new Bitcoin.TransactionOut({
            value: value,
            script: new Bitcoin.Script(script)
        });

        sendTx.addOutput(txout);
    }
    sendTx.lock_time = r['lock_time'];
    return sendTx;
};


function u8(f) { return uint(f, 1); }
function u16(f) { return uint(f, 2); }
function u32(f) { return uint(f, 4); }
function u64(f) { return uint(f, 8); }
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

BTNClientContext.Signing.deserialize = function (bytes) {
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

function readVarInt(f) {
    var t = u8(f);
    if (t == 0xfd) return u16(f); else
        if (t == 0xfe) return u32(f); else
            if (t == 0xff) return u64(f); else
                return t;
}
function readString(f) {
    var len = readVarInt(f);
    if (errv(len)) return [];
    return readBuffer(f, len);
}
function readBuffer(f, size) {
    var res = f.slice(0, size);
    for (var i = 0; i < size; i++) f.shift();
    return res;
}

function errv(val) {
    return (val instanceof BigInteger || val > 0xffff);
}
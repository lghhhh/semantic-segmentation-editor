function FastIntegerCompression() {
}

function bytelog(val) {
    if (val < (1 << 7)) {
        return 1;
    } else if (val < (1 << 14)) {
        return 2;
    } else if (val < (1 << 21)) {
        return 3;
    } else if (val < (1 << 28)) {
        return 4;
    }
    return 5;
}

// compute how many bytes an array of integers would use once compressed
FastIntegerCompression.computeCompressedSizeInBytes = function (input) {
    var c = input.length;
    var answer = 0;
    for (var i = 0; i < c; i++) {
        answer += bytelog(input[i]);
    }
    return answer;
};


// compress an array of integers, return a compressed buffer (as an ArrayBuffer)
FastIntegerCompression.compress = function (input) {
    var c = input.length;
    var buf = new ArrayBuffer(FastIntegerCompression.computeCompressedSizeInBytes(input));
    var view = new Int8Array(buf);
    var pos = 0;
    for (var i = 0; i < c; i++) {
        var val = input[i];
        if (val < (1 << 7)) {
            view[pos++] = val;
        } else if (val < (1 << 14)) {
            view[pos++] = (val & 0x7F) | 0x80;
            view[pos++] = val >>> 7;
        } else if (val < (1 << 21)) {
            view[pos++] = (val & 0x7F) | 0x80;
            view[pos++] = ((val >>> 7) & 0x7F) | 0x80;
            view[pos++] = val >>> 14;
        } else if (val < (1 << 28)) {
            view[pos++] = (val & 0x7F) | 0x80;
            view[pos++] = ((val >>> 7) & 0x7F) | 0x80;
            view[pos++] = ((val >>> 14) & 0x7F) | 0x80;
            view[pos++] = val >>> 21;
        } else {
            view[pos++] = (val & 0x7F) | 0x80;
            view[pos++] = ((val >>> 7) & 0x7F) | 0x80;
            view[pos++] = ((val >>> 14) & 0x7F) | 0x80;
            view[pos++] = ((val >>> 21) & 0x7F) | 0x80;
            view[pos++] = val >>> 28;
        }
    }
    return buf;
};

// from a compressed array of integers stored ArrayBuffer, compute the number of compressed integers by scanning the input
FastIntegerCompression.computeHowManyIntegers = function (input) {
    var view = new Int8Array(input);
    var c = view.length;
    var count = 0;
    for (var i = 0; i < c; i++) {
        count += (input[i] >>> 7);
    }
    return c - count;
};
// uncompress an array of integer from an ArrayBuffer, return the array
FastIntegerCompression.uncompress = function (input) {
    var array = [];
    var inbyte = new Int8Array(input);
    var end = inbyte.length;
    var pos = 0;

    while (end > pos) {
        var c = inbyte[pos++];
        var v = c & 0x7F;
        if (c >= 0) {
            array.push(v);
            continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 7;
        if (c >= 0) {
            array.push(v);
            continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 14;
        if (c >= 0) {
            array.push(v);
            continue;
        }
        c = inbyte[pos++];
        v |= (c & 0x7F) << 21;
        if (c >= 0) {
            array.push(v);
            continue;
        }
        c = inbyte[pos++];
        v |= c << 28;
        array.push(v)
    }
    return array;
};

LZW = {
    compress: function (uncompressed) {
        "use strict";
        // Build the dictionary.
        var i,
            dictionary = {},
            c,
            wc,
            w = "",
            result = [],
            dictSize = 256;
        //生成utf-16的字符key-value
        for (i = 0; i < 256; i += 1) {
            dictionary[String.fromCharCode(i)] = i;
        }

        for (i = 0; i < uncompressed.length; i += 1) {
            c = uncompressed.charAt(i);
            wc = w + c;
            //Do not use dictionary[wc] because javascript arrays
            //will return values for array['pop'], array['push'] etc
            // if (dictionary[wc]) {
            if (dictionary.hasOwnProperty(wc)) {// 找到最长在字典中存在地字符串
                w = wc;
            } else {
                //将前一个字典中存在的字符对应的编码加入result
                result.push(dictionary[w]);
                // Add wc to the dictionary. 将这个不存在的编码存入字典中
                dictionary[wc] = dictSize++;
                w = String(c);
            }
        }

        // Output the code for w.
        if (w !== "") {
            result.push(dictionary[w]);
        }
        return result;
    },


    decompress: function (compressed) {
        "use strict";
        // Build the dictionary.
        var i,
            dictionary = [],
            w,
            result,
            k,
            entry = "",
            dictSize = 256;
        // 生成256 个 Unicode 值 对应编码
        for (i = 0; i < 256; i += 1) {
            dictionary[i] = String.fromCharCode(i);
        }

        w = String.fromCharCode(compressed[0]);
        result = w;
        const step = Math.round(compressed.length / 100); //总长度切割 通知处理里进度
        for (i = 1; i < compressed.length; i += 1) {
            if ((i % step) == 0) {
                const value = Math.round(100 * i / compressed.length);
                self.postMessage({ operation: "progress", value }); // 每次处理1% 向主线程通知
            }
            k = compressed[i];
            if (dictionary[k]) {
                entry = dictionary[k];
            } else {
                if (k === dictSize) {
                    entry = w + w.charAt(0);
                } else {
                    return null;
                }
            }

            result += entry;

            // Add w+entry[0] to the dictionary.
            dictionary[dictSize++] = w + entry.charAt(0);

            w = entry;
        }
        return result;
    }
};

function objectToBytes(obj) {
    let payload = JSON.stringify(obj);
    payload = LZW.compress(payload);
    payload = FastIntegerCompression.compress(payload);
    return payload;
}

function bytesToObject(bytes) {

    if (bytes.byteLength > 0) {
        const data = FastIntegerCompression.uncompress(bytes);
        const str = LZW.decompress(data);
        return JSON.parse(str);
    } else return null;
}

self.addEventListener("message", (msg) => {
    const { operation, data } = msg.data;
    let result;
    if (operation == "compress") {
        result = objectToBytes(data);
    } else if (operation == "uncompress") {
        result = bytesToObject(data);
    }
    self.postMessage({ operation, result: result });
});
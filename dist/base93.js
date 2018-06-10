"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// last character is not same as original base93
// changed from " to - so it fits in json
const BASE93STR = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!#$%&'()*+,-./:;<=>?@[]^_`{|}~ ";
const ENCODING_TABLE = (() => {
    let result = new Array(93);
    for (let i = 0; i < 93; ++i) {
        result[i] = BASE93STR.charCodeAt(i);
    }
    return result;
})();
const DECODING_TABLE = (() => {
    let result = new Array(128);
    result.fill(93);
    for (let i = 0; i < 93; ++i) {
        result[BASE93STR.charCodeAt(i)] = i;
    }
    return result;
})();
class Base93 {
    static encode(data, prefix) {
        let len = data.length;
        let output;
        let ebq = 0, en = 0, ev = 0, current = 0;
        if (prefix) {
            output = new Array(prefix.length + Math.ceil(len * 8 / 6.5));
            for (; current < prefix.length; ++current) {
                output[current] = prefix.charCodeAt(current);
            }
        }
        else {
            output = new Array(Math.ceil(len * 8 / 6.5));
        }
        for (let i = 0; i < len; ++i) {
            ebq |= (data[i] & 0xFF) << en;
            en += 8;
            if (en > 13) {
                ev = ebq & 0x1FFF;
                if (ev > 456) {
                    ebq >>= 13;
                    en -= 13;
                }
                else {
                    ev = ebq & 0x3FFF;
                    ebq >>= 14;
                    en -= 14;
                }
                output[current++] = ENCODING_TABLE[ev % 93];
                output[current++] = ENCODING_TABLE[(ev / 93) | 0];
            }
        }
        if (en > 0) {
            output[current++] = ENCODING_TABLE[ebq % 93];
            if (en > 7 || ebq > 90) {
                output[current++] = ENCODING_TABLE[(ebq / 93) | 0];
            }
        }
        output.length = current;
        return String.fromCharCode.apply(null, output);
    }
    static decode(str, offset = 0, length = -1) {
        let len = offset + length;
        if (length < 0 || len > str.length) {
            len = str.length;
        }
        let output = new Array(Math.ceil((len - offset) * 7 / 8));
        let dbq = 0, dn = 0, dv = -1, current = 0;
        for (let i = offset; i < len; ++i) {
            let code = str.charCodeAt(i);
            if (code > 126)
                continue;
            let v = DECODING_TABLE[code];
            if (v === 93)
                continue;
            if (dv === -1) {
                dv = v;
            }
            else {
                dv += v * 93;
                dbq |= dv << dn;
                dn += ((dv & 0x1FFF) > 456 ? 13 : 14);
                do {
                    output[current++] = dbq & 0xFF;
                    dbq >>= 8;
                    dn -= 8;
                } while (dn > 7);
                dv = -1;
            }
        }
        if (dv !== -1) {
            output[current++] = (dbq | dv << dn);
        }
        output.length = current;
        return output;
    }
}
exports.default = Base93;
//# sourceMappingURL=base93.js.map
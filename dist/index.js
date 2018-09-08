"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Codec = require("./codec");
class JsonEsc {
    constructor() {
        this._encodeTable = new Map();
        this._decodeTable = {};
        this.registerRaw('Date', Date, Codec.encodeDate, Codec.decodeDate);
        this.registerRaw('Bin', Uint8Array, Codec.encodeUint8Array, Codec.decodeUint8Array);
    }
    registerRaw(key, type, encoder, decoder) {
        if (type && encoder) {
            this._encodeTable.set(type, encoder);
        }
        if (decoder) {
            this._decodeTable[key] = decoder;
        }
    }
    register(key, type, encoder, decoder) {
        let prefix = `\u001b${key}:`;
        let prefixLen = prefix.length;
        this._encodeTable.set(type, (self) => `${prefix}${encoder(self)}`);
        this._decodeTable[key] = (str) => decoder(str.substr(prefixLen));
    }
    reviver(key, value) {
        if (typeof value === 'string' && value.charCodeAt(0) === 0x1B) {
            if (value.length < 6) {
                switch (value) {
                    case '\u001bNaN':
                        return NaN;
                    case '\u001bInf':
                        return Infinity;
                    case '\u001b-Inf':
                        return -Infinity;
                }
            }
            let colonPos = value.indexOf(':');
            if (colonPos > -1) {
                let key = value.substring(1, colonPos);
                let decoder = this._decodeTable[key];
                if (decoder) {
                    return decoder(value);
                }
            }
            return undefined;
        }
        return value;
    }
    replacer(key, value) {
        switch (typeof value) {
            case 'number': {
                if (value !== value) {
                    return '\u001bNaN';
                }
                if (value === Infinity) {
                    return '\u001bInf';
                }
                if (value === -Infinity) {
                    return '\u001b-Inf';
                }
                break;
            }
            case 'object': {
                if (value) {
                    let encoder = this._encodeTable.get(value.constructor);
                    if (encoder) {
                        return encoder(value);
                    }
                }
            }
        }
        return value;
    }
    parse(str) {
        return JSON.parse(str, (key, value) => this.reviver(key, value));
    }
    stringify(input, space) {
        return JSON.stringify(input, (key, value) => this.replacer(key, value), space);
    }
    stringifySorted(input, space) {
        let spacesCached = 0;
        let colon = ':';
        let getSpacer = (level) => '';
        if (space >= 0) {
            colon = ': ';
            let spaces = ['\n'];
            getSpacer = (level) => {
                if (level < spacesCached) {
                    return spaces[level];
                }
                return spaces[level] = '\n'.padEnd((level - 1) * space + 1);
            };
        }
        let encodeValue = (value, level) => {
            switch (typeof value) {
                case 'number': {
                    if (value !== value) {
                        return '"\\u001bNaN"';
                    }
                    if (value === Infinity) {
                        return '"\\u001bInf"';
                    }
                    if (value === -Infinity) {
                        return '"\\u001b-Inf"';
                    }
                    return value;
                }
                case 'object': {
                    if (value) {
                        switch (value.constructor) {
                            case Object: {
                                let keys = Object.keys(value);
                                keys.sort();
                                let items = [];
                                for (let key of keys) {
                                    let val = value[key];
                                    if (val !== undefined) {
                                        items.push(`${JSON.stringify(key)}${colon}${encodeValue(val, level + 1)}`);
                                    }
                                }
                                if (items.length === 0) {
                                    return '{}';
                                }
                                else {
                                    return `{${getSpacer(level + 1)}${items.join(`,${getSpacer(level + 1)}`)}${getSpacer(level)}}`;
                                }
                            }
                            case Array: {
                                let items = [];
                                for (let val of value) {
                                    if (val !== undefined) {
                                        items.push(`${encodeValue(val, level + 1)}`);
                                    }
                                    else {
                                        items.push('null');
                                    }
                                }
                                if (items.length === 0) {
                                    return '[]';
                                }
                                else {
                                    return `[${getSpacer(level + 1)}${items.join(`,${getSpacer(level + 1)}`)}${getSpacer(level)}]`;
                                }
                            }
                            default: {
                                let encoder = this._encodeTable.get(value.constructor);
                                if (encoder) {
                                    return JSON.stringify(encoder(value));
                                }
                            }
                        }
                    }
                    return 'null';
                }
                default: {
                    return JSON.stringify(value);
                }
            }
        };
        return encodeValue(input, 0);
    }
    static parse(str) {
        return JsonEsc.defaultEncoder.parse(str);
    }
    static stringify(input, space, sorted = false) {
        if (sorted === true) {
            return JsonEsc.defaultEncoder.stringifySorted(input, space);
        }
        let dateToJSON = Date.prototype.toJSON;
        delete Date.prototype.toJSON;
        let result = JsonEsc.defaultEncoder.stringify(input, space);
        Date.prototype.toJSON = dateToJSON;
        return result;
    }
}
JsonEsc.defaultEncoder = new JsonEsc();
exports.default = JsonEsc;
//# sourceMappingURL=index.js.map
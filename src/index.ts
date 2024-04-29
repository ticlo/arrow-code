import {
  decodeBase64,
  decodeBigInt,
  decodeDate, decodeNumber,
  decodeUint8Array,
  encodeBase64,
  encodeBigInt, encodeBoolean,
  encodeDate,
  encodeNumner,
  encodeUint8Array
} from "./codec";

const UNDEFINED_ENCODED = '"͢"';
const UNDEFINED = '͢';

interface Options {
  encodeBinary?: boolean | 'base64';
  encodeDate?: boolean; // default true
  encodeBigInt?: boolean; // default true
  encodePrimitive?: boolean; // default false
}

export default class Arrow {
  private _encodeTable: Map<any, (self: object) => string> = new Map();
  private _decodeTable: { [key: string]: (str: string) => object } = {};

  encodePrimitive = false;

  constructor(options?: Options) {
    if (options?.encodeBinary === 'base64') {
      this.registerRaw('B64', Uint8Array, encodeBase64, decodeBase64);
      // only register base93 decoder, not encoder
      this.registerRaw('Bin', null, null, decodeUint8Array);
    } else if (options?.encodeBinary !== false) {
      this.registerRaw('Bin', Uint8Array, encodeUint8Array, decodeUint8Array);
      // only register base64 decoder, not encoder
      this.registerRaw('B64', null, null, decodeBase64);
    }
    if (options?.encodeDate !== false) {
      this.registerRaw('Date', Date, encodeDate, decodeDate);
    }
    if (options?.encodeBigInt !== false) {
      this.registerRaw('BigInt', BigInt, encodeBigInt, decodeBigInt);
    }

    if (options?.encodePrimitive) {
      this.encodePrimitive = true;
      this.registerRaw('Number', Number, null, decodeNumber);
    }
  }

  registerRaw(key: string, type: object,
              encoder: (self: object) => string,
              decoder: (str: string) => any) {
    if (type && encoder) {
      this._encodeTable.set(type, encoder);
    }
    if (decoder) {
      this._decodeTable[key] = decoder;
    }
  }

  register(key: string, type: object,
           encoder: (self: object) => string,
           decoder: (str: string) => object) {
    let prefix = `͢${key}:`;
    let prefixLen = prefix.length;
    this._encodeTable.set(type, (self: object) => `${prefix}${encoder(self)}`);
    this._decodeTable[key] = (str: string) => decoder(str.substring(prefixLen));
  }

  reviver(key: string, value: any): any {
    if (typeof value === 'string' && value.charCodeAt(0) === 0x362) {
      if (value.length < 7) {
        switch (value) {
          case '͢NaN':
            return NaN;
          case '͢Inf':
            return Infinity;
          case '͢-Inf':
            return -Infinity;
          case '͢true':
            return true;
          case '͢false':
            return false;
          case '͢null':
            return null;
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

  replacer(key: string, value: any, parent: any): any {
    switch (typeof value) {
      case 'number': {
        if (value !== value) {
          return '͢NaN';
        }
        if (value === Infinity) {
          return '͢Inf';
        }
        if (value === -Infinity) {
          return '͢-Inf';
        }
        break;
      }
      case 'object': {
        if (value && value.constructor !== Object) {
          let encoder = this._encodeTable.get(value.constructor);
          if (encoder) {
            return encoder(value);
          } else if ('toArrow' in value) {
            return value.toArrow();
          }
        }
        break;
      }
      case "function": {
        if ('toArrow' in value) {
          return value.toArrow();
        }
        return undefined;
      }
      case 'undefined': {
        if (Array.isArray(parent)) {
          return UNDEFINED;
        }
      }
    }
    return value;
  }

  parse(str: string): any {
    return JSON.parse(str, (key: string, value: any) => this.reviver(key, value));
  }

  stringify(input: any, space?: number): string {
    if (input === undefined) {
      return UNDEFINED_ENCODED;
    }
    let toJSONCache = new Map<any, Function>();
    for (let [cls, f] of this._encodeTable) {
      if (cls.prototype.toJSON) {
        toJSONCache.set(cls, cls.prototype.toJSON);
        delete cls.prototype.toJSON;
      }
    }
    const _this = this;

    function replacer(key: string, value: any) {
      return _this.replacer(key, value, this);
    }

    let result = JSON.stringify(input, replacer, space);

    for (let [cls, f] of toJSONCache) {
      cls.prototype.toJSON = f;
    }

    return result;
  }

  stringifySorted(input: any, space?: number): string {
    if (input === undefined) {
      return UNDEFINED_ENCODED;
    }
    let spacesCached = 0;
    let colon = ':';
    let getSpacer = (level: number) => '';
    if (space >= 0) {
      colon = ': ';
      let spaces: string[] = ['\n'];
      getSpacer = (level: number) => {
        if (level < spacesCached) {
          return spaces[level];
        }
        return spaces[level] = '\n'.padEnd((level - 1) * space + 1);
      };
    }

    let encodeValue = (value: any, level: number) => {
      switch (typeof value) {
        case 'number': {
          if (value !== value) {
            return '"͢NaN"';
          }
          if (value === Infinity) {
            return '"͢Inf"';
          }
          if (value === -Infinity) {
            return '"͢-Inf"';
          }
          return JSON.stringify(value);
        }
        case 'object': {
          if (value) {
            switch (value.constructor) {
              case Object: {
                let keys = Object.keys(value);
                keys.sort();
                let items: string[] = [];
                for (let key of keys) {
                  let val = value[key];
                  if (val !== undefined) {
                    items.push(`${JSON.stringify(key)}${colon}${encodeValue(val, level + 1)}`);
                  }
                }
                if (items.length === 0) {
                  return '{}';
                } else {
                  return `{${getSpacer(level + 1)}${items.join(`,${getSpacer(level + 1)}`)}${getSpacer(level)}}`;
                }
              }
              case Array: {
                let items: string[] = [];
                for (let val of value) {
                  if (val === undefined) {
                    items.push(UNDEFINED_ENCODED);
                  } else {
                    items.push(`${encodeValue(val, level + 1)}`);
                  }
                }
                if (items.length === 0) {
                  return '[]';
                } else {
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

  encode(input: any): string {
    const result = this.replacer(null, input, null);
    if (this.encodePrimitive) {
      switch (typeof result) {
        case "string":
          return result;
        case "number":
          return encodeNumner(input);
        case "boolean":
          return encodeBoolean(input);
        default:
          if (result === null) {
            return '͢null';
          }
      }
    } else if (typeof result === 'string') {
      return result;
    }
    return null;
  }

  decode(str: string): any {
    return this.reviver(null, str);
  }

  encodeJSON(input: any, space?: number, sortKeys: boolean = false): string {
    if (sortKeys === true) {
      return this.stringifySorted(input, space);
    } else {
      return this.stringify(input, space);
    }
  }

  decodeJSON(str: string): any {
    this.parse(str);
  }


  private static defaultEncoder: Arrow = (() => new Arrow())();

  static decodeJSON(str: string): any {
    return Arrow.defaultEncoder.parse(str);
  }

  static encodeJSON(input: any, space?: number, sortKeys: boolean = false): string {
    return Arrow.defaultEncoder.encodeJSON(input, space, sortKeys);
  }

  static encode(input: any): string {
    return Arrow.defaultEncoder.encode(input);
  }

  static decode(str: string): any {
    return Arrow.defaultEncoder.decode(str);
  }
}


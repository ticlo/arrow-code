import {
  decodeBase64, decodeBigInt,
  decodeDate,
  decodeUint8Array,
  encodeBase64, encodeBigInt,
  encodeDate,
  encodeUint8Array
} from "./codec";

const UNDEFINED_JSON = '"͢"';
const UNDEFINED = '͢';

interface ArrowObject {
  toArrow(): string;
}

function hasToArrow(obj: unknown): obj is ArrowObject {
  return 'toArrow' in (obj as any);
}

interface Options {
  encodeBinary?: boolean | 'base64'; // default true
  encodeDate?: boolean; // default true
  encodeBigInt?: boolean; // default false
}

export default class Arrow {
  private _encodeTable: Map<any, (self: object) => string> = new Map();
  private _decodeTable: { [key: string]: (str: string) => object } = {};

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
    if (options?.encodeBigInt === true) {
      this.registerRaw('n', BigInt, encodeBigInt, decodeBigInt);
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

  reviver(key: string, value: unknown): unknown {
    if (typeof value === 'string' && value.charCodeAt(0) === 0x362) {
      if (value.length < 6) {
        switch (value) {
          case '͢NaN':
            return NaN;
          case '͢Inf':
            return Infinity;
          case '͢-Inf':
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

  replacer(key: string, value: unknown, parent: unknown): unknown {
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
          } else if (hasToArrow(value)) {
            return value.toArrow();
          }
        }
        break;
      }
      case "function": {
        if (hasToArrow(value)) {
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

  parse(str: string): unknown {
    return JSON.parse(str, (key: string, value: unknown) => this.reviver(key, value));
  }

  stringify(input: unknown, space?: number): string {
    if (input === undefined) {
      return UNDEFINED_JSON;
    }
    let toJSONCache = new Map<any, Function>();
    for (let [cls, f] of this._encodeTable) {
      if (cls.prototype.toJSON) {
        toJSONCache.set(cls, cls.prototype.toJSON);
        delete cls.prototype.toJSON;
      }
    }
    const _this = this;

    function replacer(key: string, value: unknown) {
      return _this.replacer(key, value, this);
    }

    let result = JSON.stringify(input, replacer, space);

    for (let [cls, f] of toJSONCache) {
      cls.prototype.toJSON = f;
    }

    return result;
  }

  stringifySorted(input: unknown, space?: number): string {
    if (input === undefined) {
      return UNDEFINED_JSON;
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

    let encodeValue = (value: unknown, level: number) => {
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
                  let val = (value as any)[key];
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
                for (let val of value as unknown[]) {
                  if (val === undefined) {
                    items.push(UNDEFINED_JSON);
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

  encode(input: unknown): string {
    const result = this.replacer(null, input, null);
    switch (typeof result) {
      case "string":
        return result;
      case "number":
        return `͢${input}`;
      case "boolean":
        return `͢${input}`;
      case 'undefined':
        return UNDEFINED;
      case "bigint":
        return encodeBigInt(input as BigInt);
    }
    if (result === null) {
      return '͢null';
    }
    if (Array.isArray(input) || input?.constructor === Object) {
      return `͢${this.encodeJSON(input)}`;
    }
    return null;
  }

  decode(str: string): unknown {
    if (typeof str === 'string' && str.charCodeAt(0) === 0x362) {
      if (str.length < 7) {
        switch (str) {
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
          case '͢':
            return undefined;
        }
      }
      let firstChar = str.charAt(1);
      if (firstChar === '[' || firstChar === '{') {
        return this.decodeJSON(str.substring(1));
      }
      if ((firstChar >= '0' && firstChar <= '9') || firstChar === '-') {
        return Number.parseFloat(str.substring(1));
      }
      let colonPos = str.indexOf(':');
      if (colonPos > -1) {
        let key = str.substring(1, colonPos);
        let decoder = this._decodeTable[key];
        if (decoder) {
          return decoder(str);
        }
      }
      return undefined;
    }
    return str;
  }

  encodeJSON(input: unknown, space?: number, sortKeys: boolean = false): string {
    if (sortKeys === true) {
      return this.stringifySorted(input, space);
    } else {
      return this.stringify(input, space);
    }
  }

  decodeJSON(str: string): unknown {
    return this.parse(str);
  }


  private static defaultEncoder: Arrow = (() => new Arrow())();

  static decodeJSON(str: string): unknown {
    return Arrow.defaultEncoder.parse(str);
  }

  static encodeJSON(input: unknown, space?: number, sortKeys: boolean = false): string {
    return Arrow.defaultEncoder.encodeJSON(input, space, sortKeys);
  }

  static encode(input: unknown): string {
    return Arrow.defaultEncoder.encode(input);
  }

  static decode(str: string): unknown {
    return Arrow.defaultEncoder.decode(str);
  }
}


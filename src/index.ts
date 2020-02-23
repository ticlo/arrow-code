import * as Codec from './codec';

const UNDEFINED_ENCODED = '"\\u001b"';
const UNDEFINED = '\u001b';

export default class JsonEsc {
  private _encodeTable: Map<any, (self: object) => string> = new Map();
  private _decodeTable: {[key: string]: (str: string) => object} = {};


  constructor() {
    this.registerRaw('Bin', Uint8Array, Codec.encodeUint8Array, Codec.decodeUint8Array);
  }


  registerDate() {
    this.registerRaw('Date', Date, Codec.encodeDate, Codec.decodeDate);
  }

  registerRaw(key: string, type: object,
              encoder: (self: object) => string,
              decoder: (str: string) => object) {
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
    let prefix = `\u001b${key}:`;
    let prefixLen = prefix.length;
    this._encodeTable.set(type, (self: object) => `${prefix}${encoder(self)}`);
    this._decodeTable[key] = (str: string) => decoder(str.substr(prefixLen));
  }

  reviver(key: string, value: any): any {
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

  replacer(key: string, value: any, parent: any): any {
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
        if (value && value.constructor !== Object) {
          let encoder = this._encodeTable.get(value.constructor);
          if (encoder) {
            return encoder(value);
          } else if ('toJsonEsc' in value) {
            return value.toJsonEsc();
          }
        }
        break;
      }
      case "function": {
        if ('toJsonEsc' in value) {
          return value.toJsonEsc();
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
            return '"\\u001bNaN"';
          }
          if (value === Infinity) {
            return '"\\u001bInf"';
          }
          if (value === -Infinity) {
            return '"\\u001b-Inf"';
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

  private static defaultEncoder: JsonEsc = (() => {
    let defaultEncoder = new JsonEsc();
    defaultEncoder.registerDate();
    return defaultEncoder;
  })();

  static parse(str: string): any {
    return JsonEsc.defaultEncoder.parse(str);
  }

  static stringify(input: any, space?: number, sortKeys: boolean = false): string {
    if (sortKeys === true) {
      return JsonEsc.defaultEncoder.stringifySorted(input, space);
    } else {
      return JsonEsc.defaultEncoder.stringify(input, space);
    }
  }
}


import * as Codec from './codec';

export default class JsonEsc {
  private _encodeTable: Map<object, (self: object) => string> = new Map();
  private _decodeTable: { [key: string]: (str: string) => object } = {};


  constructor() {
    this.registerRaw('Date', Date, Codec.encodeDate, Codec.decodeDate);
    this.registerRaw('Bin', Uint8Array, Codec.encodeUint8Array, Codec.decodeUint8Array);
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

  replacer(key: string, value: any): any {
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
        break;
      }
      case 'undefined': {
        return '\u001b';
      }
    }
    return value;
  }

  parse(str: string): any {
    return JSON.parse(str, (key: string, value: any) => this.reviver(key, value));
  }

  stringify(input: any, space?: number): string {
    return JSON.stringify(input, (key: string, value: any) => this.replacer(key, value), space);
  }

  stringifySorted(input: any, space?: number): string {

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
          return value;
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
                  if (val !== undefined) {
                    items.push(`${encodeValue(val, level + 1)}`);
                  } else {
                    items.push('null');
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

  private static defaultEncoder: JsonEsc = new JsonEsc();
  static parse(str: string): any {
    return JsonEsc.defaultEncoder.parse(str);
  }
  static stringify(input: any, space?: number, sortKeys: boolean = false): string {
    if (sortKeys === true) {
      return JsonEsc.defaultEncoder.stringifySorted(input, space);
    }
    let dateToJSON = Date.prototype.toJSON;
    delete Date.prototype.toJSON;
    let result = JsonEsc.defaultEncoder.stringify(input, space);
    Date.prototype.toJSON = dateToJSON;
    return result;
  }
}


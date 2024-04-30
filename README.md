# Arrow Code

Arrow Code use unicode [combining character "͢ "](https://www.compart.com/en/unicode/U+0362) in string to store types that normally not allowed in JSON

#### examples

```javascript
// import Arrow from 'arrow-code';
const Arrow = require('arrow-code').default;

// encode as JSON
Arrow.encodeJSON( [
  NaN,
  -Infinity, 
  9007199254740997n,
  new Date(),
  new Uint8Array([1,2,3,4]), 
  undefined
], 1);
// returns:
[
 "͢NaN",
 "͢-Inf",
 "͢n:9007199254740997",  // BigInt
 "͢Date:2018-02-07T19:07:18.207Z",  // Date
 "͢Bin:wFg{A",  // Uint8Array
 "͢"  // undefined
]
```

## Advantage
(Arrow.encodeJSON vs MsgPack and BSON)

Arrow Code allows additional data types to be serialized in JSON, such as binary date (Uint8Array) and Date, while still keeps the verbose nature of JSON.<br>
The output string is still a 100% valid JSON, and compatible with any JSON editing/parsing tool or library. This makes Arrow Code much easier to debug and trouble shoot than binary formats like BSON and MsgPack

### Performance

Modern browsers and nodejs are highly optimized for JSON. This allows Arrow Code to be encoded and decoded faster than the other 2 formats in most of the cases.

#### benchmark result
Benchmark with [sample data](https://github.com/ticlo/arrow-code/blob/master/benchmark/sample-data.js) on Chrome 77, Firefox 69 

[Time are all in ms, smaller is better](https://github.com/ticlo/arrow-code/blob/master/benchmark/benchmark.js)

||Chrome<br>Encode|Chrome<br>Decode|Firefox<br>Encode|Firefox<br>Decode|
|:----:|:----:|:----:|:----:|:----:|
|Arrow Code|***0.1434***|***0.1742***|***0.1708***|***0.1301***|
|MsgPack|0.2893|0.1818|0.6689|0.1933|
|BSON|0.1573|0.1879|0.3945|0.5648|

## Constructor
```typescript
new Arrow({
  // whether to encode Binary ( Uint8Array ), default true, which uses Base93 encoding
  encodeBinary?: boolean | 'base64',

  // whether to encode Date, default true
  encodeDate?: boolean,

  // whether to encode BigInt, default true
  encodeBigInt?: boolean,
})
```

## API
| API                                                                             | comments                                    |
|:--------------------------------------------------------------------------------|:--------------------------------------------|
| **encodeJSON**( **inpt**: unknown, **space**?: number, **sortKeys** = false)    | encode as JSON, can be used as static api   |
| **decodeJSON**( **inpt**: string)                                               | decode JSON, can be used as static api      |
| **encode**( **inpt**: unknown)                                                  | encode to String, can be used as static api |
| **decode**( **inpt**: string)                                                   | decode String, can be used as static api    |
| **register**( **key**: string, **type**: Constructor, **encoder**, **decoder**) | register a custom type                      |

## Custom Types

Arrow Code's register API make it really easy to add custom type

```javascript
// custom type
class MyClass {
  constructor(str) {
    this.myStr = str;
  }
}

let arrow = new Arrow();
arrow.register(
  'My', // prefix
  MyClass,  // type
  (obj) => obj.myStr, // custom encoder
  (str) => new MyClass(str) // custom decoder
);

myJson.encodeJSON(new MyClass("hello"));
// "͢My:hello"
```

## Base93 encoding

Arrow Code use [Base93](https://github.com/ticlo/arrow-code/tree/master/base93) by default to encode binary data, it's more compact than Base64.

If you prefer Base64, set binaryFormat to base64 in the Arrow Code constructor

```javascript
const Arrow = require('arrow-code').default;

// use Base64 instead of Base93
const arrow = new Arrow({binaryFormat: 'base64'});

arrow.encodeJSON({binary: new Uint8Array([1,2,3,4])});
// {"binary":"͢B64:AQIDBA=="}
```

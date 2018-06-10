# Json Escape
Json Escape use escape character as prefix of string value to store types that normally not allowed in JSON

[asc character 0x1b](https://en.wikipedia.org/wiki/Escape_character#ASCII_escape_character) is used for the escaping

#### examples

```javascript
// import JsonEsc from 'jsonesc';
const JsonEsc = require('jsonesc').default;

JsonEsc.stringify( [
  NaN,
  -Infinity,
  new Date(),
  new Uint8Array([1,2,3,4])
] );
// returns:
[
 "\u001bNaN",
 "\u001b-Inf",
 "\u001bDate:2018-02-07T19:07:18.207Z",
 "\u001bBin:6Fa-A"
]
```

## Advantage

JsonEsc allows more data types to be serialized in JSON, such as binary date (Uint8Array) and Date while still keep the verbose nature of JSON. This makes JsonEsc much easier to debug and trouble shoot than binary formats like BSON and MsgPack

## Performance

In general, JSON is slower than binary formats like MsgPack or BSON. However, modern browsers and nodejs are hightly optimized for JSON. This allows JsonEsc to be encoded and decoded at similar speed as the other 2 formats.

#### benchmark result
Benchmark on Chrome67 with [sample data](https://github.com/ticlo/jsonesc/blob/master/benchmark/sample-data.js)

||Encode Time(ms)|Decode Time(ms)|
|:----:|:----:|:----:|
|JsonEsc|0.1161|0.1606|
|MsgPack|0.2465|0.1191|
|BSON|0.1255|0.1170|


## Custom Types

JsonEsc's register API make it really simple to add custom type into json encoding/decoding

```javascript
// custom type
class MyClass {
  constructor(str) {
    this.myStr = str;
  }
}

let myJson = new JsonEsc();
myJson.register('My', MyClass,
  // custom encoder
  (obj) => obj.myStr,
  // custom decoder
  (str) => new MyClass(str)
);

myJson.stringify(new MyClass("hello"));
// "\u001bMy:hello"
```

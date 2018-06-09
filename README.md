# Json Escape
Json Escape use escape character as prefix of string value to store types that normally not allowed in JSON

[asc character 0x1b](https://en.wikipedia.org/wiki/Escape_character#ASCII_escape_character) is used for the escaping

#### examples

```javascript
[
  NaN,
  -Infinity,
  new Date(),
  new Uint8Array([1,2,3,4])
]
```
#### after JsonEsc.stringify() :
```javascript
[
 "\u001bNaN",
 "\u001b-Inf",
 "\u001bDate:1518030420207",
 "\u001bBin:6Fa-A"
]
```

## Performance



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

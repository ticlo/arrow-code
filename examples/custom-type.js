// const JsonEsc = require('jsonesc')
const JsonEsc = require('../dist/index').default;

// custom type
class MyClass {
  constructor(value) {
    this.myValue = value;
  }
}

let myJson = new JsonEsc();
myJson.register('My', MyClass,
  // custom encoder
  (obj) => '\u001bMy:' + obj.myValue,
  // custom decoder
  (str) => new MyClass(str.substr(4)) // 4 == '\u001bMy:'.length
);


// test the cutom encoder
let encoded = myJson.stringify(new MyClass("hello"));
// test the cutom decoder
let decoded = myJson.parse(encoded);

console.log(encoded);  // "\u001bMy:hello"
console.log(decoded.myValue); // hello

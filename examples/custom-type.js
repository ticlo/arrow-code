// const JsonEsc = require('jsonesc').default
const JsonEsc = require('../dist/index').default;

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


// test the cutom encoder
let encoded = myJson.stringify(new MyClass("hello"));
// test the cutom decoder
let decoded = myJson.parse(encoded);

console.log(encoded);  // "\u001bMy:hello"
console.log(decoded.myStr); // hello

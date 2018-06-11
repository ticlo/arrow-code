// const JsonEsc = require('jsonesc').default;
const JsonEsc = require('../dist/index').default;
const Base64 = require("base64-js");

let myJson = new JsonEsc();
myJson.register('B64', Uint8Array,
  (uint8arr) => Base64.fromByteArray(uint8arr),
  (str) => new Uint8Array(Base64.toByteArray(str.substr(5)))
);

console.log(myJson.stringify({ binary:new Uint8Array([1,2,3,4])}));

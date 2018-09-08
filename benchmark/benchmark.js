const JsonEsc = require('../dist').default;
const MsgPack = require('msgpack-lite');

const Bson = require('bson');
const Binary = require('bson').Binary;


const sample = require('./sample-data');

// BSON use its own Binary class instead of Uint8Array
function toBsonStructure(obj) {
  if (obj) {
    if (obj instanceof Uint8Array) {
      return Binary(new Buffer(obj));
    } else if (Array.isArray(obj)) {
      let result = [];
      for (let v of obj) {
        result.push(toBsonStructure(v));
      }
      return result;
    } else if (obj.__proto__ === Object.prototype) {
      let result = {};
      for (let key in obj) {
        result[key] = toBsonStructure(obj[key]);
      }
      return result;
    }
  }
  return obj;
}
const bsonSample = toBsonStructure(sample);


let jsonescEncoded = JsonEsc.stringify(sample);
let msgpackEncoded = MsgPack.encode(sample);

let bson = new Bson([Binary]);
let bsonEncoded = bson.serialize(bsonSample);


const WARMUP_ROUND = 2000;
const ROUNd = 20000
function benchmark(str, fun) {
  for (let i = 0; i < WARMUP_ROUND; ++i) {
    fun();
  }
  let t0 = new Date();
  for (let i = 0; i < ROUNd; ++i) {
    fun();
  }
  let t1 = new Date();
  console.log(`${str} : ${(t1.getTime() - t0.getTime()) / ROUNd}`);
}

benchmark("JsonEsc encode", ()=>JsonEsc.stringify(sample));
benchmark("JsonEsc sorted encode", ()=>JsonEsc.stringify(sample, undefined, true));
benchmark("JsonEsc sorted indent encode", ()=>JsonEsc.stringify(sample, 1, true));
benchmark("MsgPack encode", ()=>MsgPack.encode(sample));
benchmark("BSON encode", ()=>bson.serialize(bsonSample));

benchmark("JsonEsc decode", ()=>JsonEsc.parse(jsonescEncoded));
benchmark("MsgPack decode", ()=>MsgPack.decode(msgpackEncoded));
benchmark("BSON decode", ()=>bson.deserialize(bsonEncoded));

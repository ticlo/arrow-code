import JsonEsc from '../lib/index';
import {assert} from 'chai';

const nanStr = '"\\u001bNaN"';
const infStr = '"\\u001bInf"';
const ninfStr = '"\\u001b-Inf"';
const undefinedStr = '"\\u001b"';

const bin = new Uint8Array([91, 82, 112, 207]);
const binStr = "\"\\u001bBin:xy'/z\"";
const b64str = '"\\u001bB64:W1Jwzw=="';

describe('esc', () => {
  it('numbers', () => {

    assert.isNaN(JsonEsc.parse(nanStr), 'decode NaN');
    assert.equal(JsonEsc.parse(infStr), Infinity, 'decode Infinity');
    assert.equal(JsonEsc.parse(ninfStr), -Infinity, 'decode -Infinity');
    assert.equal(JsonEsc.parse('1.25'), 1.25, 'decode normal value');

    assert.equal(JsonEsc.stringify(NaN), nanStr, 'encode NaN');
    assert.equal(JsonEsc.stringify(Infinity), infStr, 'encode Infinity');
    assert.equal(JsonEsc.stringify(-Infinity), ninfStr, 'encode -Infinity');
    assert.equal(JsonEsc.stringify(1.25), '1.25', 'encode normal number');
  });

  it('Date', () => {
    {
      let date = new Date(1518030438207);
      let dateStr = '"\\u001bDate:2018-02-07T19:07:18.207Z"';
      assert.equal(JsonEsc.stringify(date), dateStr, 'encode date');
      assert.equal((JsonEsc.parse(dateStr) as Date).getTime(), 1518030438207, 'decode date');
    }
    {
      let date = new Date(-1);
      let dateStr = '"\\u001bDate:1969-12-31T23:59:59.999Z"';
      assert.equal(JsonEsc.stringify(date), dateStr, 'encode date before 1970');
      assert.equal((JsonEsc.parse(dateStr) as Date).getTime(), -1, 'decode date before 1970');
    }
  });

  it('Uint8Array Base93', () => {
    assert.equal(JsonEsc.stringify(bin), binStr, 'encode Uint8Array Base93');
    assert.deepEqual(JsonEsc.parse(binStr), bin, 'decode Uint8Array Base93');
  });

  it('Uint8Array Base64', () => {
    const jsonEsc = new JsonEsc({binaryFormat: 'base64'});
    assert.equal(jsonEsc.stringify(bin), b64str, 'encode Uint8Array Base64');
    assert.deepEqual(jsonEsc.parse(b64str), bin, 'decode Uint8Array Base64');
  });

  it('object toJsonEsc', () => {
    class A {
      toJsonEsc() {
        return '\u001bA';
      }
    }

    assert.equal(JsonEsc.stringify(new A()), '"\\u001bA"');
  });

  it('function toJsonEsc', () => {
    function F() {
      // empty function
    }

    F.toJsonEsc = () => {
      return '\u001bF';
    };

    assert.equal(JsonEsc.stringify(F), '"\\u001bF"');
  });

  it('undefined', () => {
    assert.equal(JsonEsc.stringify(undefined), '"\\u001b"', 'encode undefined');
    assert.equal(JsonEsc.stringify({a: undefined}), `{}`, 'encode undefined in object');
    assert.equal(JsonEsc.stringify([undefined]), `["\\u001b"]`, 'encode undefined in array');

    let encoder = new JsonEsc();

    assert.equal(encoder.stringifySorted(undefined), '"\\u001b"', 'encode undefined');
    assert.equal(encoder.stringifySorted({a: undefined}), `{}`, 'encode undefined in object');
    assert.equal(encoder.stringifySorted([undefined]), `["\\u001b"]`, 'encode undefined in array');


    assert.equal(JsonEsc.parse('"\\u001b"'), undefined, 'undefined');
    assert.equal(JsonEsc.parse('"\\u001b?"'), undefined, 'invalid escape');
    assert.deepEqual(JsonEsc.parse('["\\u001b",1]'), [undefined, 1]);
  });

});

describe('sorted', () => {
  it('basic', () => {
    assert.equal(JsonEsc.stringify(NaN, undefined, true), nanStr, 'encode NaN');
    assert.equal(JsonEsc.stringify(1, undefined, true), '1', 'encode 1');
    assert.equal(JsonEsc.stringify("", undefined, true), '""', 'encode string');
    assert.equal(JsonEsc.stringify({}, undefined, true), '{}', 'blank Object');
    assert.equal(JsonEsc.stringify([], undefined, true), '[]', 'blank array');

    assert.equal(JsonEsc.stringify({c: 1, a: 2, b: 3}, undefined, true), '{"a":2,"b":3,"c":1}');
    assert.equal(JsonEsc.stringify({c: 1, a: 2, b: 3}, 1, true), `{
"a": 2,
"b": 3,
"c": 1
}`);

  });
});

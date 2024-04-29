import Arrow from '../lib/index';
import {assert} from 'chai';

const nanStr = '"͢NaN"';
const infStr = '"͢Inf"';
const ninfStr = '"͢-Inf"';
const undefinedStr = '"͢"';

const bin = new Uint8Array([91, 82, 112, 207]);
const binStr = "\"͢Bin:xy'/z\"";
const b64str = '"͢B64:W1Jwzw=="';

describe('json', () => {
  it('numbers', () => {

    assert.isNaN(Arrow.decodeJSON(nanStr), 'decode NaN');
    assert.equal(Arrow.decodeJSON(infStr), Infinity, 'decode Infinity');
    assert.equal(Arrow.decodeJSON(ninfStr), -Infinity, 'decode -Infinity');
    assert.equal(Arrow.decodeJSON('1.25'), 1.25, 'decode normal value');

    assert.equal(Arrow.encodeJSON(NaN), nanStr, 'encode NaN');
    assert.equal(Arrow.encodeJSON(Infinity), infStr, 'encode Infinity');
    assert.equal(Arrow.encodeJSON(-Infinity), ninfStr, 'encode -Infinity');
    assert.equal(Arrow.encodeJSON(1.25), '1.25', 'encode normal number');
  });

  it('Date', () => {
    {
      let date = new Date(1518030438207);
      let dateStr = '"͢Date:2018-02-07T19:07:18.207Z"';
      assert.equal(Arrow.encodeJSON(date), dateStr, 'encode date');
      assert.equal((Arrow.decodeJSON(dateStr) as Date).getTime(), 1518030438207, 'decode date');
    }
    {
      let date = new Date(-1);
      let dateStr = '"͢Date:1969-12-31T23:59:59.999Z"';
      assert.equal(Arrow.encodeJSON(date), dateStr, 'encode date before 1970');
      assert.equal((Arrow.decodeJSON(dateStr) as Date).getTime(), -1, 'decode date before 1970');
    }
  });

  it('Uint8Array Base93', () => {
    assert.equal(Arrow.encodeJSON(bin), binStr, 'encode Uint8Array Base93');
    assert.deepEqual(Arrow.decodeJSON(binStr), bin, 'decode Uint8Array Base93');
  });

  it('Uint8Array Base64', () => {
    const jsonEsc = new Arrow({encodeBinary: 'base64'});
    assert.equal(jsonEsc.stringify(bin), b64str, 'encode Uint8Array Base64');
    assert.deepEqual(jsonEsc.parse(b64str), bin, 'decode Uint8Array Base64');
  });

  it('object toArrow', () => {
    class A {
      toArrow() {
        return '͢A';
      }
    }

    assert.equal(Arrow.encodeJSON(new A()), '"͢A"');
  });

  it('function toArrow', () => {
    function F() {
      // empty function
    }

    F.toArrow = () => {
      return '͢F';
    };

    assert.equal(Arrow.encodeJSON(F), '"͢F"');
  });

  it('undefined', () => {
    assert.equal(Arrow.encodeJSON(undefined), '"͢"', 'encode undefined');
    assert.equal(Arrow.encodeJSON({a: undefined}), `{}`, 'encode undefined in object');
    assert.equal(Arrow.encodeJSON([undefined]), `["͢"]`, 'encode undefined in array');

    let encoder = new Arrow();

    assert.equal(encoder.stringifySorted(undefined), '"͢"', 'encode undefined');
    assert.equal(encoder.stringifySorted({a: undefined}), `{}`, 'encode undefined in object');
    assert.equal(encoder.stringifySorted([undefined]), `["͢"]`, 'encode undefined in array');


    assert.equal(Arrow.decodeJSON('"͢"'), undefined, 'undefined');
    assert.equal(Arrow.decodeJSON('"͢?"'), undefined, 'invalid escape');
    assert.deepEqual(Arrow.decodeJSON('["͢",1]'), [undefined, 1]);
  });

});

describe('sorted', () => {
  it('basic', () => {
    assert.equal(Arrow.encodeJSON(NaN, undefined, true), nanStr, 'encode NaN');
    assert.equal(Arrow.encodeJSON(1, undefined, true), '1', 'encode 1');
    assert.equal(Arrow.encodeJSON("", undefined, true), '""', 'encode string');
    assert.equal(Arrow.encodeJSON({}, undefined, true), '{}', 'blank Object');
    assert.equal(Arrow.encodeJSON([], undefined, true), '[]', 'blank array');

    assert.equal(Arrow.encodeJSON({c: 1, a: 2, b: 3}, undefined, true), '{"a":2,"b":3,"c":1}');
    assert.equal(Arrow.encodeJSON({c: 1, a: 2, b: 3}, 1, true), `{
"a": 2,
"b": 3,
"c": 1
}`);

  });
});

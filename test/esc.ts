import JsonEsc from '../dist/index';
import { assert } from 'chai';

describe('esc', () => {
  it('numbers', () => {
    let nanStr = '"\\u001bNaN"';
    let infStr = '"\\u001bInf"';
    let ninfStr = '"\\u001b-Inf"';

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
    let bin = new Uint8Array([91, 82, 112, 207]);
    let binStr = "\"\\u001bBin:xy'/z\"";
    assert.equal(JsonEsc.stringify(bin), binStr, 'encode Uint8Array Base64');
    assert.deepEqual(JsonEsc.parse(binStr), bin, 'decode Uint8Array Base64');
  });

  it('invalid input', () => {
    assert.equal(JsonEsc.parse('"\\u001b"'), undefined, 'invalid escape');
  });

});

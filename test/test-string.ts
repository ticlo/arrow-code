import Arrow from '../lib/index';
import {assert} from 'chai';

const nanStr = '͢NaN';
const infStr = '͢Inf';
const ninfStr = '͢-Inf';
const nullStr = '͢null';
const undefinedStr = '͢';
const trueStr = '͢true';
const falseStr = '͢false';

describe('string', () => {
  it('numbers', () => {
    assert.isNaN(Arrow.decode(nanStr), 'decode NaN');
    assert.isNaN(Arrow.decode(nanStr), 'decode NaN');
    assert.equal(Arrow.decode(infStr), Infinity, 'decode Infinity');
    assert.equal(Arrow.decode(ninfStr), -Infinity, 'decode -Infinity');
    assert.equal(Arrow.decode('͢1.25'), 1.25, 'decode normal value');

    assert.equal(Arrow.encode(NaN), nanStr, 'encode NaN');
    assert.equal(Arrow.encode(Infinity), infStr, 'encode Infinity');
    assert.equal(Arrow.encode(-Infinity), ninfStr, 'encode -Infinity');
    assert.equal(Arrow.encode(1.25), '͢1.25', 'encode normal number');
  });

  it('Date', () => {
    {
      let date = new Date(1518030438207);
      let dateStr = '͢Date:2018-02-07T19:07:18.207Z';
      assert.equal(Arrow.encode(date), dateStr, 'encode date');
      assert.equal((Arrow.decode(dateStr) as Date).getTime(), 1518030438207, 'decode date');
    }
  });

  it('bool', () => {
    assert.isTrue(Arrow.decode(trueStr), 'decode true');
    assert.isFalse(Arrow.decode(falseStr), 'decode false');

    assert.equal(Arrow.encode(true), trueStr, 'encode true');
    assert.equal(Arrow.encode(false), falseStr, 'encode false');
    assert.equal(Arrow.encodeJSON(true), 'true', 'encode JSON true');
    assert.equal(Arrow.encodeJSON(false), 'false', 'encode JSON false');
  });

  it('other', () => {
    assert.isNull(Arrow.decode(nullStr), 'decode null');
    assert.isUndefined(Arrow.decode(undefinedStr), 'decode undefined');

    assert.equal(Arrow.encode(null), nullStr, 'encode null');
    assert.equal(Arrow.encode(undefined), undefinedStr, 'encode undefined');
  });

  it('object', () => {
    assert.deepEqual(Arrow.decode('͢{"a":1}'), {a: 1}, 'decode object');
    assert.deepEqual(Arrow.decode('͢[1,2]'), [1, 2], 'decode array');

    assert.equal(Arrow.encode({a: 1}), '͢{"a":1}', 'encode object');
    assert.equal(Arrow.encode([1, 2]), '͢[1,2]', 'encode array');
  });

  it('BigInt', () => {
    assert.equal(Arrow.decode('͢n:1'), 1n, 'decode BigInt');

    assert.equal(Arrow.encode(2n), '͢n:2', 'encode BigInt');
  });

  it('string', () => {
    assert.equal(Arrow.decode('a'), 'a', 'decode string');
    assert.equal(Arrow.decode('͢͢a'), '͢a', 'decode arrow string');

    assert.equal(Arrow.encode('b'), 'b', 'encode string');
    assert.equal(Arrow.encode('͢b'), '͢͢b', 'encode arrow string');
  });
});

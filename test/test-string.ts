import Arrow from '../lib/index';
import {assert} from 'chai';

const nanStr = '͢NaN';
const infStr = '͢Inf';
const ninfStr = '͢-Inf';
const nullStr = '͢null';
const undefinedStr = '͢';
const trueStr = '͢true';
const falseStr = '͢false';

const arrow = new Arrow({encodePrimitive: true});

describe('string', () => {
  it('numbers', () => {
    assert.isNaN(arrow.decode(nanStr), 'decode NaN');
    assert.isNaN(arrow.decode(nanStr), 'decode NaN');
    assert.equal(arrow.decode(infStr), Infinity, 'decode Infinity');
    assert.equal(arrow.decode(ninfStr), -Infinity, 'decode -Infinity');
    assert.equal(arrow.decode('1.25'), 1.25, 'decode normal value');
    assert.equal(arrow.decode('͢Number:1.25'), 1.25, 'decode normal value');

    assert.equal(arrow.encode(NaN), nanStr, 'encode NaN');
    assert.equal(arrow.encode(Infinity), infStr, 'encode Infinity');
    assert.equal(arrow.encode(-Infinity), ninfStr, 'encode -Infinity');
    assert.equal(arrow.encode(1.25), '͢Number:1.25', 'encode normal number');
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
    assert.isTrue(arrow.decode(trueStr), 'decode true');
    assert.isFalse(arrow.decode(falseStr), 'decode false');

    assert.equal(arrow.encode(true), trueStr, 'encode true');
    assert.equal(arrow.encode(false), falseStr, 'encode false');
    assert.equal(arrow.encodeJSON(true), 'true', 'encode JSON true');
    assert.equal(arrow.encodeJSON(false), 'false', 'encode JSON false');
  });

  it('other', () => {
    assert.isNull(arrow.decode(nullStr), 'decode null');
    assert.isUndefined(arrow.decode(undefinedStr), 'decode undefined');

    assert.equal(arrow.encode(null), nullStr, 'encode null');
    assert.equal(arrow.encode(undefined), undefinedStr, 'encode undefined');
  });

  it('object', () => {
    assert.deepEqual(arrow.decode('͢{"a":1}'), {a: 1}, 'decode object');
    assert.deepEqual(arrow.decode('͢[1,2]'), [1, 2], 'decode array');

    assert.equal(arrow.encode({a: 1}), '͢{"a":1}', 'encode object');
    assert.equal(arrow.encode([1, 2]), '͢[1,2]', 'encode array');
  });
});

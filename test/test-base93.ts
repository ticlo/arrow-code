import Base93 from '../lib/base93';
import { assert } from 'chai';

describe('base93', () => {
  it('basic', () => {
    const binary = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17,
      18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 127];
    const str = "*CLhr|aIk{7|3H;+quJW*W0GC6|'1Q339EDUV[>V";
    assert.equal(Base93.encode(binary), str, 'encode');
    assert.deepEqual(Base93.decode(str), binary, 'decode');

    const prefix = '\u001bBin:';
    const prefixedStr = prefix + str;
    assert.equal(Base93.encode(binary, prefix), prefixedStr, 'encode with prefix');
    assert.deepEqual(Base93.decode(prefixedStr, prefix.length), binary, 'decode with prefix');
  });

  it('last byte', () => {
    let arr0 = [], arr255 = [], arr2N = [];
    for (let i = 1; i < 127; ++i) {
      arr0.push(0);
      arr255.push(255);
      arr2N.push(i * 2);

      assert.deepEqual(Base93.decode(Base93.encode(arr0)), arr0, 'encode all 0');
      assert.deepEqual(Base93.decode(Base93.encode(arr255)), arr255, 'encode all 255');
      assert.deepEqual(Base93.decode(Base93.encode(arr2N)), arr2N, 'encode 2n');
    }
  });
});

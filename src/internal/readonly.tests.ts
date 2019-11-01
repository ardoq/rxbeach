import { equal, AssertionError, deepEqual } from 'assert';
import { protect } from './readonly';

describe('readonly', function() {
  // type tests
  const n: null = protect(null);
  const u: undefined = protect(undefined);
  const f: false = protect(false);
  const t: true = protect(true);
  const b: boolean = protect(true as boolean);
  const s: symbol = protect(Symbol());

  const origString = 'hello';
  const actualString: string = protect(origString);
  const origNum = 2;
  const actualNum: 2 = protect(origNum);
  const origFunc = () => 'hello';
  const actualFunc: typeof origFunc = protect(origFunc);
  const origFlatObj = { foo: 'foo', bar: 'bar' };
  const flatObj = protect(origFlatObj) as typeof origFlatObj;
  const spreadedFlatObj = { ...flatObj };
  const origNestedObj = { nested: { foo: 'foo' } };
  const nestedObj = protect(origNestedObj) as typeof origNestedObj;
  const origArr = [1, 2, 3, 4];
  const arr = protect(origArr) as typeof origArr;
  const spreadedArr = [...arr];
  const origNestedArr = [[1, 2], [3, 4]];
  const nestedArr = protect(origNestedArr) as typeof origNestedArr;

  it('does not change strings', function() {
    equal(origString, actualString);
  });

  it('does not change numbers', function() {
    equal(origNum, actualNum);
  });
  it('does not change functions', function() {
    equal(origFunc, actualFunc);
  });
  it('makes keys of objects readonly 1', function() {
    try {
      flatObj.foo = 'bar';
      equal(false, true, 'property foo should not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
  it('makes keys of objects readonly 2', function() {
    try {
      flatObj.bar = 'foo';
      equal(false, true, 'property bar should not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
  it('objects should still be spreadable', function() {
    deepEqual(spreadedFlatObj, origFlatObj);
  });
  it('makes keys of nested keys of objects readonly', function() {
    try {
      nestedObj.nested.foo = 'bar';
      equal(false, true, 'nested property foo shuld not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
  it('makes array elements readonly', function() {
    try {
      arr[1] = 1;
      equal(false, true, 'array element should not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
  it('makes arrays readonly', function() {
    try {
      arr.push(1);
      equal(false, true, 'array should not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
  it('arrays should be spreadable', function() {
    deepEqual(spreadedArr, arr);
  });
  it('array elements should not be writable', function() {
    try {
      nestedArr[0][0] = 3;
      equal(false, true, 'array element should not be writable');
    } catch (err) {
      if (err instanceof AssertionError) throw err;
    }
  });
});

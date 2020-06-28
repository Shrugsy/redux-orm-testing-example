import chai from 'chai';
import sinonChai from 'sinon-chai';
import freeze from 'deep-freeze';
import { ops, canMutate, getBatchToken } from '../index';
chai.use(sinonChai);
var expect = chai.expect;
describe('batched', function () {
  it('works', function () {
    var res = ops.batched(function (batchOps) {
      var obj = {};
      var result = batchOps.set('a', 1, obj);
      expect(result).to.deep.equal({
        a: 1
      });
      expect(result).not.to.equal(obj);
      var result2 = batchOps.omit('a', result);
      expect(result2).to.equal(result);
      expect(result2).to.deep.equal({});
      return result2;
    });
    expect(res).to.deep.equal({});
  });
});
describe('operations', function () {
  describe('object', function () {
    describe('batched mutations', function () {
      var token = getBatchToken();
      it('deepMerges', function () {
        var baseObj = freeze({
          change: 'Tommi',
          dontChange: 25,
          deeper: {
            dontChange: 'John',
            change: 30
          }
        });
        var mergeObj = freeze({
          change: 'None',
          add: 'US',
          deeper: {
            add: 'US',
            change: 35
          }
        });
        var merger = ops.batch.deepMerge(token, mergeObj);
        var result = merger(baseObj);
        expect(canMutate(result, token)).to.be["true"];
        expect(canMutate(result.deeper, token)).to.be["true"];
        expect(canMutate(result, getBatchToken())).to.be["false"];
        expect(canMutate(result.deeper, getBatchToken())).to.be["false"];
        expect(result).to.not.equal(baseObj);
        expect(result).to.contain.all.keys(['change', 'dontChange', 'add', 'deeper']);
        expect(result.change).to.not.equal(baseObj.change);
        expect(result.dontChange).to.equal(baseObj.dontChange);
        expect(result.deeper).to.not.equal(baseObj.deeper);
        expect(result.deeper).to.contain.all.keys(['dontChange', 'change', 'add']);
        expect(result.deeper.dontChange).to.equal(baseObj.deeper.dontChange);
        expect(result.deeper.change).to.not.equal(baseObj.deeper.change);
      });
      it('omits a single key', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var omitter = ops.batch.omit(token, 'age');
        var result = omitter(obj);
        expect(canMutate(result, token)).to.be["true"];
        expect(canMutate(result, getBatchToken())).to.be["false"];
        expect(result).to.not.contain.keys(['age']); // Further modification should mutate the existing object.

        expect(ops.batch.omit(token, 'name', result)).to.equal(result);
      });
      it('omits an array of keys', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var omitter = ops.batch.omit(token, ['age']);
        var result = omitter(obj);
        expect(canMutate(result, token)).to.be["true"];
        expect(canMutate(result, getBatchToken())).to.be["false"];
        expect(result).to.not.contain.keys(['age']); // Further modification should mutate the existing object.

        expect(ops.batch.omit(token, ['name'], result)).to.equal(result);
      });
      it('sets a value', function () {
        var obj = freeze({
          one: 1,
          two: 500,
          three: 3
        });
        var result = ops.batch.set(token, 'two', 5, obj);
        expect(canMutate(result, token)).to.be["true"];
        var result2 = ops.batch.set(token, 'two', 2, result);
        expect(result2).to.deep.equal({
          one: 1,
          two: 2,
          three: 3
        });
        expect(result).to.equal(result2);
      });
      it('sets a value in path', function () {
        var obj = freeze({
          first: {
            second: {
              value: 'value',
              maintain: true
            },
            maintain: true
          },
          maintain: true
        });
        var setter = ops.batch.setIn(token, 'first.second.value', 'anotherValue');
        var result = setter(obj);
        expect(canMutate(result, token)).to.be["true"];
        expect(canMutate(result, getBatchToken())).to.be["false"];
        expect(result).not.to.equal(obj);
        expect(result.first.second.value).to.equal('anotherValue');
        expect(result.maintain).to.be["true"];
        expect(result.first.maintain).to.be["true"];
        expect(result.first.second.maintain).to.be["true"];
        var result2 = ops.batch.setIn(token, 'first.second.value', 'secondAnotherValue', result);
        expect(result).to.equal(result2);
        expect(result2.first.second.value).to.equal('secondAnotherValue');
      });
    });
    describe('immutable ops', function () {
      it('deepMerges', function () {
        var baseObj = freeze({
          change: 'Tommi',
          dontChange: 25,
          deeper: {
            dontChange: 'John',
            change: 30
          }
        });
        var mergeObj = freeze({
          change: 'None',
          add: 'US',
          deeper: {
            add: 'US',
            change: 35
          }
        });
        var merger = ops.deepMerge(mergeObj);
        var result = merger(baseObj);
        expect(canMutate(result)).to.be["false"];
        expect(canMutate(result.deeper)).to.be["false"];
        expect(result).to.not.equal(baseObj);
        expect(result).to.contain.all.keys(['change', 'dontChange', 'add', 'deeper']);
        expect(result.change).to.not.equal(baseObj.change);
        expect(result.dontChange).to.equal(baseObj.dontChange);
        expect(result.deeper).to.not.equal(baseObj.deeper);
        expect(result.deeper).to.contain.all.keys(['dontChange', 'change', 'add']);
        expect(result.deeper.dontChange).to.equal(baseObj.deeper.dontChange);
        expect(result.deeper.change).to.not.equal(baseObj.deeper.change);
      });
      it('deepMerges and returns initial object when no values changed', function () {
        var baseObj = freeze({
          deep: {
            dontChange: 'John'
          }
        });
        var mergeObj = freeze({
          deep: {
            dontChange: 'John'
          }
        });
        var result = ops.deepMerge(mergeObj, baseObj);
        expect(result).to.equal(baseObj);
      });
      it('omits a single key', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var omitter = ops.omit('age');
        var result = omitter(obj);
        expect(canMutate(result)).to.be["false"];
        expect(result).to.not.contain.keys(['age']);
      });
      it('omits a single key, returns same object if no value changes', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var result = ops.omit('location', obj);
        expect(result).to.equal(obj);
      });
      it('omits an array of keys', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var omitter = ops.omit(['age']);
        var result = omitter(obj);
        expect(canMutate(result)).to.be["false"];
        expect(result).to.not.contain.keys(['age']);
      });
      it('sets a value', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var result = ops.set('age', 26, obj);
        expect(result).to.deep.equal({
          name: 'Tommi',
          age: 26
        });
      });
      it('sets a value and returns the initial value of no changes', function () {
        var obj = freeze({
          name: 'Tommi',
          age: 25
        });
        var result = ops.set('age', 25, obj);
        expect(result).to.equal(obj);
      });
      it('sets a value in path', function () {
        var obj = freeze({
          first: {
            second: {
              value: 'value',
              maintain: true
            },
            maintain: true
          },
          maintain: true
        });
        var setter = ops.setIn('first.second.value', 'anotherValue');
        var result = setter(obj);
        expect(canMutate(result)).to.be["false"];
        expect(result).not.to.equal(obj);
        expect(result.first.second.value).to.equal('anotherValue');
        expect(result.maintain).to.be["true"];
        expect(result.first.maintain).to.be["true"];
        expect(result.first.second.maintain).to.be["true"];
      });
      it('sets a value in path but returns same object if no value changes', function () {
        var obj = freeze({
          first: {
            second: {
              value: 'value',
              maintain: true
            },
            maintain: true
          },
          maintain: true
        });
        var result = ops.setIn('first.second.value', 'value', obj);
        expect(result).to.equal(obj);
      });
    });
  });
  describe('array', function () {
    describe('batched mutations', function () {
      var token = getBatchToken();
      it('push', function () {
        var push = ops.batch.push;
        var arr = freeze([5, 4]);
        var pusher = push(token, freeze([1, 2, 3]));
        var result = pusher(arr);
        expect(result).to.not.equal(arr);
        expect(result).to.deep.equal([5, 4, 1, 2, 3]);
        var result2 = push(token, [4, 5], result);
        expect(result).to.equal(result2);
        expect(result2).to.deep.equal([5, 4, 1, 2, 3, 4, 5]);
      });
      it('insert', function () {
        var insert = ops.batch.insert;
        var arr = freeze([1, 2, 5]);
        var inserter = insert(token, 2, freeze([3, 4]));
        var result = inserter(arr);
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
        var result2 = insert(token, 2, [1000], result);
        expect(result).to.equal(result2);
        expect(result2).to.deep.equal([1, 2, 1000, 3, 4, 5]);
      });
      it('filter', function () {
        var arr = freeze([0, 1, 2, 3]);
        var result = ops.batch.filter(token, function (item) {
          return item % 2 === 0;
        }, arr);
        expect(canMutate(result, token)).to.be["true"];
        expect(result).to.deep.equal([0, 2]);
        expect(canMutate(result, getBatchToken())).to.be["false"];
        var result2 = ops.batch.filter(token, function (item) {
          return item === 2;
        }, result);
        expect(result2).to.equal(result);
        expect(result2).to.deep.equal([2]);
      });
      it('set', function () {
        var set = ops.batch.set;
        var arr = freeze([1, 2, 987, 4]);
        var setter = set(token, 2, 3);
        var result = setter(arr);
        expect(canMutate(result, token)).to.be["true"];
        expect(canMutate(result, getBatchToken())).to.be["false"];
        expect(result).to.deep.equal([1, 2, 3, 4]);
        var result2 = set(token, 2, 1000, result);
        expect(result).to.equal(result2);
        expect(result2).to.deep.equal([1, 2, 1000, 4]);
      });
      it('splice with deletions', function () {
        var splice = ops.batch.splice;
        var arr = freeze([1, 2, 3, 3, 3, 4]);
        var splicer = splice(token, 2, 2, []);
        var result = splicer(arr);
        expect(result).to.deep.equal([1, 2, 3, 4]);
        var result2 = splice(token, 2, 1, [], result);
        expect(result2).to.equal(result);
        expect(result2).to.deep.equal([1, 2, 4]);
      });
      it('splice with additions', function () {
        var splice = ops.batch.splice;
        var arr = freeze([1, 5]);
        var splicer = splice(token, 1, 0, [2, 3, 4]);
        var result = splicer(arr);
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
        var result2 = splice(token, 0, 1, [1000], result);
        expect(result).to.equal(result2);
        expect(result2).to.deep.equal([1000, 2, 3, 4, 5]);
      });
    });
    describe('immutable ops', function () {
      it('push', function () {
        var push = ops.push;
        var arr = freeze([5, 4]);
        var pusher = push(freeze([1, 2, 3]));
        var result = pusher(arr);
        expect(result).to.not.equal(arr);
        expect(result).to.deep.equal([5, 4, 1, 2, 3]);
      });
      it('insert', function () {
        var insert = ops.insert;
        var arr = freeze([1, 2, 5]);
        var inserter = insert(2, freeze([3, 4]));
        var result = inserter(arr);
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      });
      it('filter', function () {
        var arr = freeze([0, 1, 2, 3]);
        var result = ops.filter(function (item) {
          return item % 2 === 0;
        }, arr);
        expect(result).to.deep.equal([0, 2]);
        expect(canMutate(result)).to.be["false"];
      });
      it('filter with no effect should return initial array', function () {
        var arr = freeze([0, 1, 2, 3]);
        var result = ops.filter(function (item) {
          return item < 4;
        }, arr);
        expect(result).to.equal(arr);
      });
      it('set', function () {
        var arr = freeze([1, 2, 987, 4]);
        var result = ops.set(2, 3, arr);
        expect(canMutate(result)).to.be["false"];
        expect(result).to.deep.equal([1, 2, 3, 4]);
      });
      it('set with no effect should return initial array', function () {
        var arr = freeze([1, 2, 3, 4]);
        var result = ops.set(2, 3, arr);
        expect(result).to.equal(arr);
      });
      it('splice with deletions', function () {
        var splice = ops.splice;
        var arr = freeze([1, 2, 3, 3, 3, 4]);
        var splicer = splice(2, 2, []);
        var result = splicer(arr);
        expect(result).to.deep.equal([1, 2, 3, 4]);
      });
      it('splice with additions', function () {
        var splice = ops.splice;
        var arr = freeze([1, 5]);
        var splicer = splice(1, 0, [2, 3, 4]);
        var result = splicer(arr);
        expect(result).to.deep.equal([1, 2, 3, 4, 5]);
      });
    });
  });
});
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.canMutate = canMutate;
exports.getImmutableOps = getImmutableOps;
exports["default"] = exports.ops = exports.getBatchToken = void 0;

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _typeof2 = _interopRequireDefault(require("@babel/runtime/helpers/typeof"));

var _ramda = require("ramda");

function forOwn(obj, fn) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      fn(obj[key], key);
    }
  }
}

function isArrayLike(value) {
  return value && (0, _typeof2["default"])(value) === 'object' && typeof value.length === 'number' && value.length >= 0 && value.length % 1 === 0;
}

var OWNER_ID_TAG = '@@_______immutableOpsOwnerID';

function fastArrayCopy(arr) {
  var copied = new Array(arr.length);

  for (var i = 0; i < arr.length; i++) {
    copied[i] = arr[i];
  }

  return copied;
}

function canMutate(obj, ownerID) {
  if (!ownerID) return false;
  return obj[OWNER_ID_TAG] === ownerID;
}

var newOwnerID = typeof Symbol === 'function' ? function () {
  return Symbol('ownerID');
} : function () {
  return {};
};
var getBatchToken = newOwnerID;
exports.getBatchToken = getBatchToken;

function addOwnerID(obj, ownerID) {
  Object.defineProperty(obj, OWNER_ID_TAG, {
    value: ownerID,
    configurable: true,
    enumerable: false
  });
  return obj;
}

function prepareNewObject(instance, ownerID) {
  if (ownerID) {
    addOwnerID(instance, ownerID);
  }

  return instance;
}

function forceArray(arg) {
  if (!(arg instanceof Array)) {
    return [arg];
  }

  return arg;
}

var PATH_SEPARATOR = '.';

function normalizePath(pathArg) {
  if (typeof pathArg === 'string') {
    if (pathArg.indexOf(PATH_SEPARATOR) === -1) {
      return [pathArg];
    }

    return pathArg.split(PATH_SEPARATOR);
  }

  return pathArg;
}

function mutableSet(key, value, obj) {
  obj[key] = value;
  return obj;
}

function mutableSetIn(_pathArg, value, obj) {
  var originalPathArg = normalizePath(_pathArg);
  var pathLen = originalPathArg.length;
  var done = false;
  var idx = 0;
  var acc = obj;
  var curr = originalPathArg[idx];

  while (!done) {
    if (idx === pathLen - 1) {
      acc[curr] = value;
      done = true;
    } else {
      var currType = (0, _typeof2["default"])(acc[curr]);

      if (currType === 'undefined') {
        var newObj = {};
        prepareNewObject(newObj, null);
        acc[curr] = newObj;
      } else if (currType !== 'object') {
        var pathRepr = "".concat(originalPathArg[idx - 1], ".").concat(curr);
        throw new Error("A non-object value was encountered when traversing setIn path at ".concat(pathRepr, "."));
      }

      acc = acc[curr];
      idx++;
      curr = originalPathArg[idx];
    }
  }

  return obj;
}

function valueInPath(_pathArg, obj) {
  var pathArg = normalizePath(_pathArg);
  var acc = obj;

  for (var i = 0; i < pathArg.length; i++) {
    var curr = pathArg[i];
    var currRef = acc[curr];

    if (i === pathArg.length - 1) {
      return currRef;
    }

    if ((0, _typeof2["default"])(currRef) === 'object') {
      acc = currRef;
    } else {
      return undefined;
    }
  }

  return undefined;
}

function immutableSetIn(ownerID, _pathArg, value, obj) {
  var pathArg = normalizePath(_pathArg);
  var currentValue = valueInPath(pathArg, obj);
  if (value === currentValue) return obj;
  var pathLen = pathArg.length;
  var acc;

  if (canMutate(obj, ownerID)) {
    acc = obj;
  } else {
    acc = Object.assign(prepareNewObject({}, ownerID), obj);
  }

  var rootObj = acc;
  pathArg.forEach(function (curr, idx) {
    if (idx === pathLen - 1) {
      acc[curr] = value;
      return;
    }

    var currRef = acc[curr];
    var currType = (0, _typeof2["default"])(currRef);

    if (currType === 'object') {
      if (canMutate(currRef, ownerID)) {
        acc = currRef;
      } else {
        var newObj = prepareNewObject({}, ownerID);
        acc[curr] = Object.assign(newObj, currRef);
        acc = newObj;
      }

      return;
    }

    if (currType === 'undefined') {
      var _newObj = prepareNewObject({}, ownerID);

      acc[curr] = _newObj;
      acc = _newObj;
      return;
    }

    var pathRepr = "".concat(pathArg[idx - 1], ".").concat(curr);
    throw new Error("A non-object value was encountered when traversing setIn path at ".concat(pathRepr, "."));
  });
  return rootObj;
}

function mutableMerge(isDeep, _mergeObjs, baseObj) {
  var mergeObjs = forceArray(_mergeObjs);

  if (isDeep) {
    mergeObjs.forEach(function (mergeObj) {
      forOwn(mergeObj, function (value, key) {
        if (isDeep && baseObj.hasOwnProperty(key)) {
          var assignValue;

          if ((0, _typeof2["default"])(value) === 'object') {
            assignValue = mutableMerge(isDeep, [value], baseObj[key]);
          } else {
            assignValue = value;
          }

          baseObj[key] = assignValue;
        } else {
          baseObj[key] = value;
        }
      });
    });
  } else {
    Object.assign.apply(Object, [baseObj].concat((0, _toConsumableArray2["default"])(mergeObjs)));
  }

  return baseObj;
}

var mutableShallowMerge = mutableMerge.bind(null, false);
var mutableDeepMerge = mutableMerge.bind(null, true);

function mutableOmit(_keys, obj) {
  var keys = forceArray(_keys);
  keys.forEach(function (key) {
    delete obj[key];
  });
  return obj;
}

function shouldMergeKey(obj, other, key) {
  return obj[key] !== other[key];
}

function immutableMerge(isDeep, ownerID, _mergeObjs, obj) {
  if (canMutate(obj, ownerID)) return mutableMerge(isDeep, _mergeObjs, obj);
  var mergeObjs = forceArray(_mergeObjs);
  var hasChanges = false;
  var nextObject = obj;

  var willChange = function willChange() {
    if (!hasChanges) {
      hasChanges = true;
      nextObject = Object.assign({}, obj);
      prepareNewObject(nextObject, ownerID);
    }
  };

  mergeObjs.forEach(function (mergeObj) {
    forOwn(mergeObj, function (mergeValue, key) {
      if (isDeep && obj.hasOwnProperty(key)) {
        var currentValue = nextObject[key];

        if ((0, _typeof2["default"])(mergeValue) === 'object' && !(mergeValue instanceof Array)) {
          if (shouldMergeKey(nextObject, mergeObj, key)) {
            var recursiveMergeResult = immutableMerge(isDeep, ownerID, mergeValue, currentValue);

            if (recursiveMergeResult !== currentValue) {
              willChange();
              nextObject[key] = recursiveMergeResult;
            }
          }

          return true; // continue forOwn
        }
      }

      if (shouldMergeKey(nextObject, mergeObj, key)) {
        willChange();
        nextObject[key] = mergeValue;
      }

      return undefined;
    });
  });
  return nextObject;
}

var immutableDeepMerge = immutableMerge.bind(null, true);
var immutableShallowMerge = immutableMerge.bind(null, false);

function immutableArrSet(ownerID, index, value, arr) {
  if (canMutate(arr, ownerID)) return mutableSet(index, value, arr);
  if (arr[index] === value) return arr;
  var newArr = fastArrayCopy(arr);
  newArr[index] = value;
  prepareNewObject(newArr, ownerID);
  return newArr;
}

function immutableSet(ownerID, key, value, obj) {
  if (isArrayLike(obj)) return immutableArrSet(ownerID, key, value, obj);
  if (canMutate(obj, ownerID)) return mutableSet(key, value, obj);
  if (obj[key] === value) return obj;
  var newObj = Object.assign({}, obj);
  prepareNewObject(newObj, ownerID);
  newObj[key] = value;
  return newObj;
}

function immutableOmit(ownerID, _keys, obj) {
  if (canMutate(obj, ownerID)) return mutableOmit(_keys, obj);
  var keys = forceArray(_keys);
  var keysInObj = keys.filter(function (key) {
    return obj.hasOwnProperty(key);
  }); // None of the keys were in the object, so we can return `obj`.

  if (keysInObj.length === 0) return obj;
  var newObj = Object.assign({}, obj);
  keysInObj.forEach(function (key) {
    delete newObj[key];
  });
  prepareNewObject(newObj, ownerID);
  return newObj;
}

function mutableArrPush(_vals, arr) {
  var vals = forceArray(_vals);
  arr.push.apply(arr, (0, _toConsumableArray2["default"])(vals));
  return arr;
}

function mutableArrFilter(func, arr) {
  var currIndex = 0;
  var originalIndex = 0;

  while (currIndex < arr.length) {
    var item = arr[currIndex];

    if (!func(item, originalIndex)) {
      arr.splice(currIndex, 1);
    } else {
      currIndex++;
    }

    originalIndex++;
  }

  return arr;
}

function mutableArrSplice(index, deleteCount, _vals, arr) {
  var vals = forceArray(_vals);
  arr.splice.apply(arr, [index, deleteCount].concat((0, _toConsumableArray2["default"])(vals)));
  return arr;
}

function mutableArrInsert(index, _vals, arr) {
  return mutableArrSplice(index, 0, _vals, arr);
}

function immutableArrSplice(ownerID, index, deleteCount, _vals, arr) {
  if (canMutate(arr, ownerID)) return mutableArrSplice(index, deleteCount, _vals, arr);
  var vals = forceArray(_vals);
  var newArr = arr.slice();
  prepareNewObject(newArr, ownerID);
  newArr.splice.apply(newArr, [index, deleteCount].concat((0, _toConsumableArray2["default"])(vals)));
  return newArr;
}

function immutableArrInsert(ownerID, index, _vals, arr) {
  if (canMutate(arr, ownerID)) return mutableArrInsert(index, _vals, arr);
  return immutableArrSplice(ownerID, index, 0, _vals, arr);
}

function immutableArrPush(ownerID, vals, arr) {
  return immutableArrInsert(ownerID, arr.length, vals, arr);
}

function immutableArrFilter(ownerID, func, arr) {
  if (canMutate(arr, ownerID)) return mutableArrFilter(func, arr);
  var newArr = arr.filter(func);
  if (newArr.length === arr.length) return arr;
  prepareNewObject(newArr, ownerID);
  return newArr;
}

var immutableOperations = {
  // object operations
  merge: immutableShallowMerge,
  deepMerge: immutableDeepMerge,
  omit: immutableOmit,
  setIn: immutableSetIn,
  // array operations
  insert: immutableArrInsert,
  push: immutableArrPush,
  filter: immutableArrFilter,
  splice: immutableArrSplice,
  // both
  set: immutableSet
};
var mutableOperations = {
  // object operations
  merge: mutableShallowMerge,
  deepMerge: mutableDeepMerge,
  omit: mutableOmit,
  setIn: mutableSetIn,
  // array operations
  insert: mutableArrInsert,
  push: mutableArrPush,
  filter: mutableArrFilter,
  splice: mutableArrSplice,
  // both
  set: mutableSet
};

function getImmutableOps() {
  var immutableOps = Object.assign({}, immutableOperations);
  forOwn(immutableOps, function (value, key) {
    immutableOps[key] = (0, _ramda.curry)(value.bind(null, null));
  });
  var mutableOps = Object.assign({}, mutableOperations);
  forOwn(mutableOps, function (value, key) {
    mutableOps[key] = (0, _ramda.curry)(value);
  });
  var batchOps = Object.assign({}, immutableOperations);
  forOwn(batchOps, function (value, key) {
    batchOps[key] = (0, _ramda.curry)(value);
  });

  function batched(_token, _fn) {
    var token;
    var fn;

    if (typeof _token === 'function') {
      fn = _token;
      token = getBatchToken();
    } else {
      token = _token;
      fn = _fn;
    }

    var immutableOpsBoundToToken = Object.assign({}, immutableOperations);
    forOwn(immutableOpsBoundToToken, function (value, key) {
      immutableOpsBoundToToken[key] = (0, _ramda.curry)(value.bind(null, token));
    });
    return fn(immutableOpsBoundToToken);
  }

  return Object.assign(immutableOps, {
    mutable: mutableOps,
    batch: batchOps,
    batched: batched,
    __: _ramda.__,
    getBatchToken: getBatchToken
  });
}

var ops = getImmutableOps();
exports.ops = ops;
var _default = ops;
exports["default"] = _default;
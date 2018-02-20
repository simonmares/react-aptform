// @flow

// NOTE_REVIEW: add typing

export function mapObjVals(obj: *, mapFunc: *) {
  const mappedObj = {};
  for (const key of Object.keys(obj)) {
    mappedObj[key] = mapFunc(obj[key]);
  }
  return mappedObj;
}

export function mapObj(obj: *, mapFunc: *) {
  const mappedObj = {};
  for (const key of Object.keys(obj)) {
    const [mappedKey, mappedValue] = mapFunc(key, obj[key]);
    mappedObj[mappedKey] = mappedValue;
  }
  return mappedObj;
}

export function findObj(obj: *, findFunc: *) {
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (findFunc(key, value)) {
      return [key, value];
    }
  }
  return undefined;
}

export function objValues(obj: *) {
  const keys = Object.keys(obj);
  return keys.map(k => obj[k]);
}

export function filterObj<T: Object>(obj: T, filterFunc: *): $Shape<T> {
  const filteredObj = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const isTrue = filterFunc(key, value);
    if (isTrue) {
      filteredObj[key] = value;
    }
  }
  return filteredObj;
}

export function shallowEquals(objA: Object, objB: Object) {
  // From https://github.com/moroshko/shallow-equal (MIT)
  if (objA === objB) {
    return true;
  }

  const aKeys = Object.keys(objA);
  const bKeys = Object.keys(objB);
  const len = aKeys.length;

  if (bKeys.length !== len) {
    return false;
  }

  for (var i = 0; i < len; i++) {
    const key = aKeys[i];

    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
}

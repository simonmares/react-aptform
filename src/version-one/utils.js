// @flow

import type { InputValue } from './types';

import { isButton, nonNil as nonNilOrDefault } from '../aptform/utils';

export function sortByArray<T: *>(arr: Array<T>, sortedArr: Array<T>): Array<T> {
  const compareFunction = (a: T, b: T) => {
    return sortedArr.indexOf(a) - sortedArr.indexOf(b);
  };
  return [...arr].sort(compareFunction);
}

export function mapObjVals(obj: *, mapFunc: *) {
  const mappedObj = {};
  for (const key of Object.keys(obj)) {
    mappedObj[key] = mapFunc(obj[key]);
  }
  return mappedObj;
}

export function objValuesByKeys(obj: *, keys: *) {
  return keys.map((k) => obj[k]);
}

export function objValues(obj: *): Array<*> {
  return Object.keys(obj).map((k) => obj[k]);
}

// Returns object values filtered by filterFunc.
export function filterObjValues(obj: *, filterFunc: *): Array<*> {
  const keys = Object.keys(obj);
  return keys.filter((k) => filterFunc(obj[k])).map((k) => obj[k]);
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

const numValueOrUndef = (numValue) => (Number.isNaN(numValue) ? undefined : numValue);
const arrayIncludes = (array, item) => array.indexOf(item) !== -1;

export function getInputValue(element: HTMLInputElement): ?InputValue {
  if (element.type === 'checkbox') {
    return element.checked;
  }

  if (arrayIncludes(['number', 'range'], element.type)) {
    const numValue = parseFloat(element.value);
    // NaN evaluates to false,
    return numValue ? numValue : numValueOrUndef(numValue);
  }

  return element.value;
}

export { isButton, nonNilOrDefault };

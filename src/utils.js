// @flow

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
  return keys.map(k => obj[k]);
}

// Returns object values filtered by filterFunc.
export function filterObjValues(obj: *, filterFunc: *): Array<*> {
  const keys = Object.keys(obj);
  return keys.filter(k => filterFunc(obj[k])).map(k => obj[k]);
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

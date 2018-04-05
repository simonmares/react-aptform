// @flow weak

export function sortByArray(arr: Array<any>, sortedArr: Array<any>) {
  const compareFunction = (a, b) => {
    return sortedArr.indexOf(a) - sortedArr.indexOf(b);
  };
  return [...arr].sort(compareFunction);
}

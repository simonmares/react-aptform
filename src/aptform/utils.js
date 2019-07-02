// @flow

export function nonNil<T>(val: ?T, defaultVal: T): T {
  return val !== undefined && val !== null ? val : defaultVal;
}

export function isButton(el: HTMLInputElement): boolean {
  return ['submit', 'reset', 'button', 'menu'].includes(el.type);
}

// @flow

import * as React from 'react';

export const defaultProps = {
  inputs: {},
  initialValues: {},
  onSubmit: () => {},
  render: () => <div />,
};

export function createChangeEvent(props: {| name: string, value: string |}) {
  // creates minimal stub to mock change event
  // usage: to test onChange method.
  const target = {
    name: props.name,
    value: props.value,
  };
  return { target, preventDefault: jest.fn };
}

export function changeInputValue(form: *, inputName: string, value: string) {
  // $FlowFixMe
  form.changeInput(inputName, value);
}

export function createSubmitEvent() {
  // $FlowFixMe
  return { preventDefault: jest.fn() };
}

export function triggerSubmit(form: *) {
  const e = createSubmitEvent();
  // $FlowFixMe
  form.onSubmit(e);
}

export function triggerBlur(form: *, inputName: string, targetProps?: Object) {
  const e = { target: { name: inputName, ...targetProps } };
  // $FlowFixMe
  form.onBlur(e);
}

export function triggerFocus(form: *, inputName: string) {
  const e = { target: { name: inputName } };
  // $FlowFixMe
  form.onFocus(e);
}

export function toStableJSON(obj: Object): string {
  // only shallow objects
  return JSON.stringify(obj, Object.keys(obj).sort());
}

export function resolveAfter<T>(value: T, time: number = 0): Promise<T> {
  return new Promise(resolve => {
    setTimeout(() => resolve(value), time);
  });
}

export function rejectAfter<T>(value: T, time: number = 0): Promise<T> {
  return new Promise((resolve, reject) => {
    setTimeout(() => reject(value), time);
  });
}

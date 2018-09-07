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

export function toStableJSON(obj: Object): string {
  // only shallow objects
  return JSON.stringify(obj, Object.keys(obj).sort());
}

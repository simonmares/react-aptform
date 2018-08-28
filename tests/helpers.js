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

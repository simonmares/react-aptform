// @flow

import React from 'react';

export const defaultProps = {
  inputs: {},
  onSubmit: () => ({
    then: () => {},
  }),
  render: jest.fn(() => <div />),
};

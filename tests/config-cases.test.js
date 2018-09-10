// @flow

import * as React from 'react';
import { render } from 'react-testing-library';

import { preconfigure } from '../src/index';

import { defaultProps, toStableJSON as toJSON } from './helpers';

describe('initialValid', () => {
  // The input is required but initial value is empty.

  // If we provide initialValid: true, the input will be considered valid, otherwise not.

  const inputs = { email: { required: true } };
  const initialValues = { email: '' };

  test('initialValid === true', () => {
    const Aptform = preconfigure({ initialValid: true });
    const { container } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs }) => toJSON({ valid: inputs.email.valid })}
      />
    );
    expect(container.textContent).toBe(toJSON({ valid: true }));
  });

  test('initialValid === false', () => {
    const Aptform = preconfigure({ initialValid: false });
    const { container } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs }) => toJSON({ valid: inputs.email.valid })}
      />
    );
    expect(container.textContent).toBe(toJSON({ valid: false }));
  });
});

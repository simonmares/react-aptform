// @flow

import * as React from 'react';
import { render, waitForElement, cleanup } from '@testing-library/react';

import { Aptform } from '../src/index';

import {
  defaultProps,
  toStableJSON as toJSON,
  changeInputValue,
  // resolveAfter,
  // rejectAfter,
} from './helpers';

describe('synchronizing', () => {
  const inputs = { email: { required: true } };
  const initialValues = { email: 'InitialValue' };

  afterEach(() => {
    cleanup();
  });

  test('onChange', async () => {
    const onChange = jest.fn();

    let form;
    let renderCount = 0;
    const { container, getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        onChange={onChange}
        render={(renderProps) => {
          renderCount += 1;
          form = renderProps.form;
          const { email } = renderProps.inputs;
          return toJSON({ value: email.value, renderCount });
        }}
      />
    );

    expect(container.textContent).toBe(toJSON({ value: 'InitialValue', renderCount: 1 }));

    changeInputValue(form, 'email', 'UpdatedValue');

    // rerenders:
    // 1) initial
    // 2) change
    // 3) on delay => reset validity
    // 4) validation => set validity
    // 5) on type timeout => not typing

    // the onChange should be called only when the value is not changing (stopped typing)
    await waitForElement(() => getByText(toJSON({ value: 'UpdatedValue', renderCount: 5 })));
    expect(onChange).toHaveBeenCalledWith('email', 'UpdatedValue');
  });
});

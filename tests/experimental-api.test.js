// @flow

import * as React from 'react';
import { render, waitForElement, cleanup } from 'react-testing-library';

import { Aptform } from '../src/index';

import {
  defaultProps,
  toStableJSON as toJSON,
  changeInputValue,
  resolveAfter,
  rejectAfter,
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
        render={renderProps => {
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

describe('async validation', () => {
  const inputs = {
    password: {
      validateAsync: () => resolveAfter({ asyncError: 'isNew' }, 0),
      errorTextMap: {
        isNew: 'You have used this password.',
      },
    },
  };

  afterEach(() => {
    cleanup();
  });

  test('shows async validation error', async () => {
    let form;

    const renderMock = jest.fn(renderProps => {
      const { password } = renderProps.inputs;
      form = renderProps.form;
      return toJSON({
        isValid: password.isValid(),
        value: password.value,
        errorText: password.errorText,
      });
    });

    const { getByText, container } = render(
      <Aptform {...defaultProps} inputs={inputs} render={renderMock} />
    );

    // input must be valid on client, before async validations are called
    expect(container.textContent).toBe(toJSON({ isValid: true, value: '', errorText: '' }));

    // trigger async validation
    changeInputValue(form, 'password', 'A');

    // still valid until async validation resolves
    await waitForElement(() => getByText(toJSON({ isValid: true, value: 'A', errorText: '' })));

    // still async validation resolved to false => not valid
    await waitForElement(() =>
      getByText(toJSON({ isValid: false, value: 'A', errorText: 'You have used this password.' }))
    );
  });

  test('async validation rejected', async () => {
    let form;

    const renderMock = jest.fn(renderProps => {
      const { password } = renderProps.inputs;
      form = renderProps.form;
      return toJSON({
        isValidating: password.isValidating(),
        isValid: password.isValid(),
        asyncValidating: password.asyncValidating,
        // value: password.value,
        // errorText: password.errorText,
      });
    });

    const validateAsync = jest.fn(() => rejectAfter({ asyncError: 'isNew' }, 0));
    const onError = jest.fn();

    const { getByText, container } = render(
      <Aptform
        {...defaultProps}
        onError={onError}
        inputs={{
          password: {
            ...inputs.password,
            validateAsync,
          },
        }}
        render={renderMock}
      />
    );

    // input must be valid on client, before async validations are called
    expect(container.textContent).toBe(
      toJSON({ isValid: true, isValidating: false, asyncValidating: false })
    );

    // trigger async validation
    changeInputValue(form, 'password', 'A');

    // still valid until async validation resolves
    await waitForElement(() =>
      getByText(toJSON({ isValid: true, isValidating: true, asyncValidating: true }))
    );

    // still async validation resolved to false => not valid
    await waitForElement(() =>
      getByText(toJSON({ isValid: true, isValidating: false, asyncValidating: false }))
    );

    expect(validateAsync).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});

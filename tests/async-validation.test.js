// @flow

import React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Aptform } from '../src/index';

import {
  defaultProps,
  toStableJSON as toJSON,
  changeInputValue,
  resolveAfter,
  rejectAfter,
} from './helpers';

jest.setTimeout(1000);

describe('...', () => {
  const inputs = {
    password: {
      asyncValidations: { isNew: () => resolveAfter(false, 0) },
      errorTextMap: {
        isNew: 'You have used this password.',
      },
    },
  };

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

    const isNew = jest.fn(() => rejectAfter(null, 0));
    const onError = jest.fn();

    const { getByText, container } = render(
      <Aptform
        {...defaultProps}
        onError={onError}
        inputs={{
          password: {
            ...inputs.password,
            asyncValidations: { isNew },
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

    expect(isNew).toHaveBeenCalled();
    expect(onError).toHaveBeenCalled();
  });
});

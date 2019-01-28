// @flow

import React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps, toStableJSON as toJSON, changeInputValue } from './helpers';

jest.setTimeout(1000); // 1 second

const validators = (() => {
  const coerceString = (val: any): string => {
    if (val === undefined || val === null) {
      return '';
    }
    return String(val);
  };

  const matches = (regexp: RegExp) => (value: mixed) => {
    return regexp.test(coerceString(value));
  };

  return {
    includesNum: matches(/[0-9]/),
    includesAlpha: matches(/[A-Z]/i),
  };
})();

describe('custom errors', () => {
  const inputs = {
    password: {
      validations: { includesNum: validators.includesNum, includesAlpha: validators.includesAlpha },
      validationOrder: ['includesNum', 'includesAlpha'],
      errorTextMap: {
        includesNum: 'Must contain a numeric value.',
        includesAlpha: 'Must contain an alphabet value.',
      },
    },
  };

  test('invalid input with custom message', async () => {
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

    expect(renderMock).toHaveBeenCalled();

    // is valid because its not required and its empty
    expect(container.textContent).toBe(toJSON({ isValid: true, value: '', errorText: '' }));

    changeInputValue(form, 'password', 'A');

    // is valid because validation not finished
    // NoteReview(simon): is this ok?
    await waitForElement(() => getByText(toJSON({ isValid: true, value: 'A', errorText: '' })));

    // is not valid => validation finished
    await waitForElement(() =>
      getByText(toJSON({ isValid: false, value: 'A', errorText: 'Must contain a numeric value.' }))
    );

    changeInputValue(form, 'password', '2');
    await waitForElement(() =>
      getByText(
        toJSON({ isValid: false, value: '2', errorText: 'Must contain an alphabet value.' })
      )
    );

    changeInputValue(form, 'password', 'A2');
    await waitForElement(() => getByText(toJSON({ isValid: true, value: 'A2', errorText: '' })));
  });

  test('required input with custom validation', async () => {
    let form;

    const renderMock = jest.fn(renderProps => {
      const { password } = renderProps.inputs;
      form = renderProps.form;
      return toJSON({
        isValidating: password.isValidating(),
        isValid: password.isValid(),
        value: password.value,
        errorText: password.errorText,
      });
    });

    const { getByText, container } = render(
      <Aptform
        {...defaultProps}
        inputs={{ password: { ...inputs.password, required: true } }}
        render={renderMock}
      />
    );

    expect(renderMock).toHaveBeenCalled();

    // with initial state its invalid because its required and its empty
    expect(container.textContent).toBe(
      toJSON({
        isValid: false,
        isValidating: false,
        value: '',
        errorText: 'This input is required.',
      })
    );

    // trigger the validation by changing it
    changeInputValue(form, 'password', '');

    // expect default message for required input not filled.
    await waitForElement(() =>
      getByText(
        toJSON({
          isValid: false,
          isValidating: false,
          value: '',
          errorText: 'This input is required.',
        })
      )
    );

    changeInputValue(form, 'password', 'A');
    await waitForElement(() =>
      getByText(
        toJSON({
          isValid: false,
          isValidating: false,
          value: 'A',
          errorText: 'Must contain a numeric value.',
        })
      )
    );

    changeInputValue(form, 'password', '2');
    await waitForElement(() =>
      getByText(
        toJSON({
          isValid: false,
          isValidating: false,
          value: '2',
          errorText: 'Must contain an alphabet value.',
        })
      )
    );

    changeInputValue(form, 'password', 'A2');
    await waitForElement(() =>
      getByText(toJSON({ isValid: true, isValidating: false, value: 'A2', errorText: '' }))
    );
  });
});

describe('builtin errors', () => {});

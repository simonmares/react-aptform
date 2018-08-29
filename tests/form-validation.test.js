// @flow

import * as React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps } from './helpers';

function mergeWithDefaultProps(props) {
  const finalProps = {
    ...defaultProps,
    ...props,
  };
  return finalProps;
}

describe('initial state', () => {
  test('required and empty => not valid', () => {
    let results = {};

    const renderMock = jest.fn(({ form }) => {
      results.formValid = form.isValid();
      return 'mock';
    });

    const props = mergeWithDefaultProps({
      inputs: { email: { required: true }, password: { required: true } },
      render: renderMock,
      initialValues: { email: '', password: '' },
    });

    render(<Aptform {...props} />);
    expect(renderMock).toHaveBeenCalled();
    expect(results.formValid).toBe(false);
  });

  test('required and with values => valid', () => {
    let results = {};

    const renderMock = jest.fn(({ form }) => {
      results.formValid = form.isValid();
      return 'mock';
    });

    const props = mergeWithDefaultProps({
      inputs: { email: { required: true }, password: { required: true } },
      render: renderMock,
      initialValues: { email: 'hello@example.com', password: 'fdisojpaofdsj' },
    });

    render(<Aptform {...props} />);
    expect(renderMock).toHaveBeenCalled();
    expect(results.formValid).toBe(true);
  });
});

describe('form-wide validation', () => {
  const arePasswordsSame = values => {
    if (values.password === '' || values.passwordAgain === '') {
      return true;
    }
    if (values.password === values.passwordAgain) {
      return true;
    }
    return false;
  };

  const testFormConfig = {
    typeTimeout: 0,
  };

  test('validates', async () => {
    let results = {};

    const renderMock = jest.fn(({ form }) => {
      results.changeInput = form.changeInput;
      return form.isValid() ? 'form_is_valid' : 'form_is_not_valid';
    });

    const reactEl = (
      <Aptform
        {...defaultProps}
        config={testFormConfig}
        initialValues={{
          password: 'ahoj',
          passwordAgain: 'ahojky',
        }}
        inputs={{
          password: {
            required: true,
          },
          passwordAgain: {
            required: true,
            errorTextMap: {
              arePasswordsSame: 'Passwords must match',
            },
          },
        }}
        formValidations={{
          passwordAgain: { arePasswordsSame },
        }}
        render={renderMock}
      />
    );

    const { getByText, container } = render(reactEl);
    expect(renderMock).toHaveBeenCalled();

    // initial values are invalid
    expect(container.textContent).toBe('form_is_not_valid');

    // fix input
    results.changeInput('password', 'ahojky23!');
    results.changeInput('passwordAgain', 'ahojky23!');

    // form-wide validation is valid now
    await waitForElement(() => getByText('form_is_valid'));
    expect(container.textContent).toBe('form_is_valid');
  });
});

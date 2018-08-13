// @flow

import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

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

    shallow(<Aptform {...props} />);
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

    shallow(<Aptform {...props} />);
    expect(renderMock).toHaveBeenCalled();
    expect(results.formValid).toBe(true);
  });
});

describe('form-wide validation', () => {
  const waitForValidation = formConfig => {
    // Wait to onFinishedTyping be called
    jest.runTimersToTime(formConfig.typeTimeout);
  };

  jest.useFakeTimers();

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
      results.formValid = form.isValid();
      results.changeInput = form.changeInput;
      return 'mock';
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

    const setInputStateSpy = sinon.spy(Aptform.prototype, 'setInputState');
    const wrapper = shallow(reactEl);
    expect(renderMock).toHaveBeenCalled();
    // initial values are invalid
    expect(results.formValid).toBe(false);

    results.changeInput('password', 'ahojky23!');
    results.changeInput('passwordAgain', 'ahojky23!');

    const rerenderInputState = async () => {
      const setStatePromise = setInputStateSpy.returnValues.pop();
      await setStatePromise;
      wrapper.update();
    };

    waitForValidation(testFormConfig);
    await rerenderInputState();

    // form-wide validation is valid now
    expect(results.formValid).toBe(true);
  });
});

// @flow

import React from 'react';
import { shallow } from 'enzyme';
import sinon from 'sinon';

import { Aptform } from '../src/index';
import { defaultProps } from './helpers';

jest.useFakeTimers();

test('All state transition', async () => {
  const receivedProps = {
    inputs: {},
    form: {},
  };

  const renderAptform = jest.fn(({ form, inputs }) => {
    receivedProps.inputs = inputs;
    receivedProps.form = form;
    return null;
  });

  const testFormConfig = {
    typeTimeout: 50,
    msgInvalid: '(test) This input is invalid.',
  };

  const waitForValidation = () => {
    // Wait to onFinishedTyping be called
    jest.runTimersToTime(testFormConfig.typeTimeout);
  };

  const renderMain = jest.fn(props => {
    return (
      <Aptform
        config={testFormConfig}
        {...defaultProps}
        render={renderAptform}
        initialValues={{ email: '' }}
        inputs={{
          email: {
            validations: { isJoe: val => /joe/.test(val), isEmail: val => /[.+@.+]/.test(val) },
            required: true,
          },
        }}
      />
    );
  });

  const setInputStateSpy = sinon.spy(Aptform.prototype, 'setInputState');
  const wrapper = shallow(renderMain());

  expect(renderAptform).toHaveBeenCalled();

  // Test default input state
  {
    const { email } = receivedProps.inputs;
    // Assert value is empty text by default
    expect(email.value).toEqual('');
    // Assert not changing
    expect(email.changing).toEqual(false);
    // Assert value is considered valid by default
    expect(email.valid).toEqual(true);
    // Assert not changed yet
    expect(email.pristine).toEqual(true);
    // Assert not touched yet
    expect(email.touched).toEqual(false);
    // Assert do not show validation result
    expect(email.showSuccess()).toEqual(false);
    expect(email.showError()).toEqual(false);
    // Assert no client errors exist yet
    expect(email.clientErrors).toEqual({});
  }

  const { changeInput } = receivedProps.form;

  const rerenderInputState = async () => {
    await setInputStateSpy.returnValues.pop();
    wrapper.update();
  };

  changeInput('email', 'Eliana');

  // Test input value has been updated but validation is pending
  {
    const { email } = receivedProps.inputs;
    // Assert value updated
    expect(email.value).toEqual('Eliana');
    // Assert value is changing
    expect(email.changing).toEqual(true);
    // Assert validity is unknown
    expect(email.valid).toEqual(undefined);
    // Assert email has been changed
    expect(email.pristine).toEqual(false);
    // Assert input has been activated
    expect(email.touched).toEqual(true);
    // Assert do not show validation result
    expect(email.showSuccess()).toEqual(false);
    expect(email.showError()).toEqual(false);
    expect(email.isValidating()).toEqual(true);
  }

  // update immediate changes
  await rerenderInputState();
  // wait for typing timeout
  waitForValidation();
  // update "changing" state
  await rerenderInputState();

  // Test validation result
  {
    const { email } = receivedProps.inputs;
    // should not be in validating mode anymore
    expect(email.isValidating()).toEqual(false);
    // Assert after typeTimeout the input is not considered to be changing
    expect(email.changing).toEqual(false);
    // Assert validation result is updated in the input state
    expect(email.valid).toEqual(false);
    // Assert validation isJoe is marked as failed
    expect(email.clientErrors.isJoe).toEqual(true);
    // Assert validation isEmail is marked as failed
    expect(email.clientErrors.isEmail).toEqual(true);
    // Assert has some error text
    expect(email.errorText).toEqual(testFormConfig.msgInvalid);
  }

  changeInput('email', 'joe');
  await rerenderInputState();

  // Test is in validating mode
  {
    const { email } = receivedProps.inputs;
    expect(email.isValidating()).toEqual(true);
  }

  waitForValidation();

  // Test validation has different results
  {
    const { email } = receivedProps.inputs;
    // Assert updated
    expect(email.changing).toEqual(false);
    // Assert input is still not valid
    expect(email.valid).toEqual(false);
    expect(email.isValidating()).toEqual(false);

    // Assert validation isJoe is marked as succeeded
    expect(email.clientErrors.isJoe).toEqual(false);
    // Assert validation isEmail is marked as failed
    expect(email.clientErrors.isEmail).toEqual(true);

    // NOTE_REVIEW(FIXME): Why is it empty?
    // expect(email.errorText).toEqual(testFormConfig.msgInvalid);
  }

  changeInput('email', 'joe@example.com');
  await rerenderInputState();
  waitForValidation();

  // Test validation has different results
  {
    const { email } = receivedProps.inputs;
    // Assert updated
    expect(email.changing).toEqual(false);
    // Assert input is now valid
    expect(email.valid).toEqual(true);

    // Assert validation isJoe is marked as succeeded
    expect(email.clientErrors.isJoe).toEqual(false);
    // Assert validation isEmail is marked as succeeded
    expect(email.clientErrors.isEmail).toEqual(false);
    // Error text has been reseted
    expect(email.errorText).toEqual('');
  }
});

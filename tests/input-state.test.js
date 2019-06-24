// @flow

import React from 'react';
import { render, waitForElement } from '@testing-library/react';

import { Aptform } from '../src/index';
import { defaultProps } from './helpers';

test('All state transition', async () => {
  const receivedProps = {
    inputs: {},
    form: {},
  };

  const testFormConfig = {
    typeTimeout: 50,
    msgInvalid: '(test) This input is invalid.',
  };

  const renderMock = jest.fn(({ form, inputs }) => {
    receivedProps.inputs = inputs;
    receivedProps.form = form;
    const { email } = inputs;
    if (email.valid) {
      return 'email__valid';
    }
    if (email.value === 'joe') {
      if (email.isValidating()) {
        return 'email__value__joe__validating';
      }
      if (email.clientErrors.isJoe === false) {
        return 'email__value__is__joe__valid';
      }
      if (email.changing) {
        return 'email__value__joe__changing';
      }

      return '?';
    }
    if (email.clientErrors.isEmail) {
      return 'email__error__is_not_email';
    }
    if (email.value === 'Eliana') {
      return 'email__value__Eliana';
    }
    return null;
  });

  const { getByText } = render(
    <Aptform
      config={testFormConfig}
      {...defaultProps}
      render={renderMock}
      initialValues={{ email: '' }}
      inputs={{
        email: {
          validations: { isJoe: (val) => /joe/.test(val), isEmail: (val) => /[.+@.+]/.test(val) },
          required: true,
        },
      }}
    />
  );

  expect(renderMock).toHaveBeenCalled();

  // Test default input state
  {
    const { email } = receivedProps.inputs;
    // Assert value is empty text by default
    expect(email.value).toEqual('');
    // Assert not changing
    expect(email.changing).toEqual(false);
    // Assert value is invalid
    expect(email.valid).toEqual(false);
    // Assert not changed yet
    expect(email.pristine).toEqual(true);
    // Assert not touched yet
    expect(email.touched).toEqual(false);
    // Assert do not show validation result
    expect(email.showSuccess()).toEqual(false);
    expect(email.showError()).toEqual(true);
    // Assert no client errors exist yet
    expect(email.clientErrors).toEqual({ required: true });
  }

  const { changeInput } = receivedProps.form;
  changeInput('email', 'Eliana');

  await waitForElement(() => getByText('email__value__Eliana'));

  // Test input value has been updated but validation is pending
  {
    const { email } = receivedProps.inputs;
    // Assert value updated
    expect(email.value).toEqual('Eliana');
    // Assert value is changing
    expect(email.changing).toEqual(true);
    // Assert validity is unknown
    // expect(email.valid).toEqual(undefined);
    // Assert email has been changed
    expect(email.pristine).toEqual(false);
    // Assert input has been activated
    expect(email.touched).toEqual(true);
    // Assert do not show validation result
    expect(email.showSuccess()).toEqual(false);
    expect(email.showError()).toEqual(false);
    // expect(email.isValidating()).toEqual(true);
  }

  await waitForElement(() => getByText('email__error__is_not_email'));

  // Test validation result
  {
    const { email } = receivedProps.inputs;
    // should not be in validating mode anymore

    expect(email.isValidating()).toEqual(false);

    // Assert after typeTimeout the input is not considered to be changing

    // validating finished, but can be still considered chaning based on typeTimeout config
    expect(email.changing).toEqual(true);

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
  // await waitForElement(() => getByText('email__value__joe__validating'));

  // // Test is in validating mode
  // {
  //   const { email } = receivedProps.inputs;
  //   expect(email.isValidating()).toEqual(true);
  // }

  await waitForElement(() => getByText('email__value__is__joe__valid'));

  // Test validation of 2 rules has different results
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

    // see testFormConfig for the value
    expect(email.errorText).toEqual('(test) This input is invalid.');
  }

  changeInput('email', 'joe@example.com');
  await waitForElement(() => getByText('email__valid'));

  // Test validation successfull
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

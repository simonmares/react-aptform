// @flow

import * as React from 'react';
import { render, waitForElement, cleanup } from 'react-testing-library';

import { preconfigure } from '../src/index';

import { defaultProps, toStableJSON as toJSON, changeInputValue, triggerBlur, triggerSubmit } from './helpers';

describe('initialValid', () => {
  beforeEach(() => {
    cleanup();
  });

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

describe('validationPolicy', () => {
  beforeEach(() => {
    cleanup();
  });

  const createExclusivePolicy = policy => ({
    onMount: false,
    onCreate: false,
    onBlur: false,
    onSubmit: false,
    ...policy,
  });

  const inputs = { email: { required: true } };
  const initialValues = { email: '' };

  test('no policy', async () => {
    const validationPolicy = createExclusivePolicy({});
    const Aptform = preconfigure({ validationPolicy });

    let renderCount = 0;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email } }) =>
          toJSON({
            valid: email.valid,
            isValid: email.isValid(),
            renderCount: ++renderCount,
            errorText: email.errorText,
          })
        }
      />
    );

    // Note: JSON stringify omits undefined values, so valid is missing.
    // We ask whether email is considered valid by isValid() and since its unknown it returns false.
    await waitForElement(() =>
      getByText(toJSON({ renderCount: 1, errorText: '', isValid: false }))
    );
  });

  test('onMount', async () => {
    const validationPolicy = createExclusivePolicy({ onMount: true });
    const Aptform = preconfigure({ validationPolicy });

    let renderCount = 0;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email } }) =>
          toJSON({ valid: email.valid, renderCount: ++renderCount, errorText: email.errorText })
        }
      />
    );

    // renders: 1) initial 2) setting is valid 3) setting errorText
    await waitForElement(() =>
      getByText(toJSON({ valid: false, renderCount: 3, errorText: 'This input is required.' }))
    );
  });

  test('onCreate', async () => {
    const validationPolicy = createExclusivePolicy({ onCreate: true });
    const Aptform = preconfigure({ validationPolicy });

    let renderCount = 0;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email } }) =>
          toJSON({ valid: email.valid, renderCount: ++renderCount, errorText: email.errorText })
        }
      />
    );

    await waitForElement(() =>
      getByText(toJSON({ valid: false, renderCount: 1, errorText: 'This input is required.' }))
    );
  });

  test('onChange', async () => {
    const validationPolicy = createExclusivePolicy({ onChange: true });
    const Aptform = preconfigure({ validationPolicy });

    let form;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email }, form: formPassed }) => {
          form = formPassed;
          return toJSON({
            valid: email.valid,
            errorText: email.errorText,
          });
        }}
      />
    );

    // not validated => .valid is undefined => omitted
    await waitForElement(() => getByText(toJSON({ errorText: '' })));

    // trigger change event
    changeInputValue(form, 'email', '');

    // input is known to be invalid and errorText is available
    await waitForElement(() =>
      getByText(toJSON({ errorText: 'This input is required.', valid: false }))
    );
  });

  test('onBlur', async () => {
    const validationPolicy = createExclusivePolicy({ onBlur: true });
    const Aptform = preconfigure({ validationPolicy });

    let form;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email }, form: formPassed }) => {
          form = formPassed;
          return toJSON({
            valid: email.valid,
            errorText: email.errorText,
          });
        }}
      />
    );

    // not validated => .valid is undefined => omitted
    await waitForElement(() => getByText(toJSON({ errorText: '' })));

    // trigger event
    triggerBlur(form, 'email');

    // input is known to be invalid and errorText is available
    await waitForElement(() =>
      getByText(toJSON({ errorText: 'This input is required.', valid: false }))
    );
  });

  test.skip('onSubmit', async () => {
    const validationPolicy = createExclusivePolicy({ onSubmit: true });
    const Aptform = preconfigure({ validationPolicy });

    let form;
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        inputs={inputs}
        initialValues={initialValues}
        render={({ inputs: { email }, form: formPassed }) => {
          form = formPassed;
          return toJSON({
            valid: email.valid,
            errorText: email.errorText,
          });
        }}
      />
    );

    // not validated => .valid is undefined => omitted
    await waitForElement(() => getByText(toJSON({ errorText: '' })));

    // trigger event
    triggerSubmit(form);

    // input is known to be invalid and errorText is available
    await waitForElement(() =>
      getByText(toJSON({ errorText: 'This input is required.', valid: false }))
    );

  });

});

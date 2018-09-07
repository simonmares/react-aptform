// @flow

import React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps, changeInputValue, toStableJSON, triggerSubmit } from './helpers';

describe('form.onSubmit defensivity', () => {
  beforeEach(() => {
    global.console.warn = jest.fn();
  });

  afterEach(() => {
    global.console.warn.mockRestore();
  });

  function createSubmitEvent() {
    return { preventDefault: jest.fn() };
  }

  test('should call preventDefault and onSubmit prop', () => {
    const renderMock = jest.fn(({ form }) => {
      const e = createSubmitEvent();
      form.onSubmit(e);
      expect(e.preventDefault).toBeCalled();
      return 'mock';
    });

    const onSubmitMock = jest.fn();
    render(<Aptform {...defaultProps} render={renderMock} onSubmit={onSubmitMock} />);

    expect(renderMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();

    expect(console.warn).toBeCalledWith('Call of onSubmit prop did not return Promise');
  });

  test('should not call missing onSubmit prop (its optional)', () => {
    const renderMock = jest.fn(({ form }) => {
      const e = createSubmitEvent();
      form.onSubmit(e);
      return 'mock';
    });

    const props = { ...defaultProps };
    delete props.onSubmit;

    expect(() => {
      render(<Aptform {...props} render={renderMock} />);
    }).not.toThrow();

    expect(renderMock).toHaveBeenCalled();
  });
});

describe('onSubmit resolved => update input values', () => {
  const inputs = {
    firstName: { required: true },
    lastName: { required: true },
  };

  const initialValues = {
    firstName: 'Charlie',
    lastName: 'Jones',
  };

  test('no value or empty object => resets', async () => {
    for (const resolveValue of [undefined, {}]) {
      // it resets on submit if onSubmit promise resolves with no value

      let form;
      const renderMock = jest.fn(renderProps => {
        form = renderProps.form;
        const { firstName, lastName } = renderProps.inputs;
        return `firstName: ${firstName.value}; lastName: ${lastName.value}`;
      });

      const onSubmitMock = jest.fn(() => Promise.resolve(resolveValue));
      const { getByText } = render(
        <Aptform
          {...defaultProps}
          render={renderMock}
          onSubmit={onSubmitMock}
          inputs={inputs}
          initialValues={initialValues}
          config={{ resetOnSubmit: true }}
        />
      );

      changeInputValue(form, 'firstName', 'Karlik');

      await waitForElement(() => getByText('firstName: Karlik; lastName: Jones'));

      triggerSubmit(form);
      expect(onSubmitMock).toHaveBeenCalled();

      await waitForElement(() => getByText('firstName: Charlie; lastName: Jones'));
    }
  });

  test('data => updates input values', async () => {
    // it resets the form with new values

    // $FlowFixMe
    let form;
    const renderMock = jest.fn(renderProps => {
      form = renderProps.form;
      const { firstName, lastName } = renderProps.inputs;
      return `firstName: ${firstName.value}; lastName: ${lastName.value}`;
    });

    const onSubmitMock = jest.fn(() =>
      Promise.resolve({ data: { firstName: 'Zoe', lastName: 'Williams' } })
    );
    const { getByText } = render(
      <Aptform
        {...defaultProps}
        render={renderMock}
        onSubmit={onSubmitMock}
        inputs={inputs}
        initialValues={initialValues}
        config={{ resetOnSubmit: true }}
      />
    );

    changeInputValue(form, 'firstName', 'Karlik');

    await waitForElement(() => getByText('firstName: Karlik; lastName: Jones'));

    triggerSubmit(form);
    expect(onSubmitMock).toHaveBeenCalled();

    // - it ignores the resetOnSubmit config
    // - the changed value Karlik is discarded
    // - the initial value Charlie is discarded
    await waitForElement(() => getByText('firstName: Zoe; lastName: Williams'));
  });
});

describe('onSubmit resolved => errors', () => {
  const initialValues = {
    nameHandle: 'charley1!!!',
    username: 'john',
  };

  const inputs = {
    nameHandle: {
      required: true,
      errorTextMap: {
        invalidChars: 'do not use special characters',
      },
    },
    username: {
      required: true,
      errorTextMap: {
        alreadyExists: 'user already taken',
      },
    },
  };

  test('errors', async () => {
    let form;
    const renderMock = jest.fn(renderProps => {
      form = renderProps.form;
      const { nameHandle, username } = renderProps.inputs;
      return `nameHandle error: ${nameHandle.errorText}; username error: ${
        username.errorText
      }; submit failed: ${String(form.submitFailed)}`;
    });

    const onSubmitMock = jest.fn(() =>
      Promise.resolve({ errors: { nameHandle: 'invalidChars', username: 'alreadyExists' } })
    );

    const { getByText, container } = render(
      <Aptform
        {...defaultProps}
        render={renderMock}
        onSubmit={onSubmitMock}
        inputs={inputs}
        initialValues={initialValues}
      />
    );

    // first: no error
    expect(container.textContent).toBe(
      'nameHandle error: ; username error: ; submit failed: false'
    );

    triggerSubmit(form);
    expect(onSubmitMock).toHaveBeenCalled();

    // then: submit errors (mapped to text)
    await waitForElement(() =>
      getByText(
        'nameHandle error: do not use special characters; username error: user already taken; submit failed: true'
      )
    );
  });

  test('submitError', async () => {
    const edgecases = [
      { submitError: true, submitErrorText: 'Unknown error ocurred.' },
      { submitError: '', submitErrorText: 'Unknown error ocurred.' },
      { submitError: 'unknownError', submitErrorText: 'Unknown error ocurred.' },
      { submitError: 'WHAT-EVER-ERROR', submitErrorText: 'Unknown error ocurred.' },
    ];

    for (const { submitError, submitErrorText } of edgecases) {
      let form;
      const renderMock = jest.fn(renderProps => {
        form = renderProps.form;
        return `submit failed: ${String(form.submitFailed)}; error: ${form.submitErrorText}`;
      });

      const onSubmitMock = jest.fn(() => Promise.resolve({ submitError }));

      const { getByText, container } = render(
        <Aptform
          {...defaultProps}
          render={renderMock}
          onSubmit={onSubmitMock}
          inputs={inputs}
          initialValues={initialValues}
        />
      );

      // first: no error
      expect(container.textContent).toBe('submit failed: false; error: ');

      triggerSubmit(form);
      expect(onSubmitMock).toHaveBeenCalled();

      // then: submit failed
      await waitForElement(() => getByText(`submit failed: true; error: ${submitErrorText}`));
    }
  });

  test('errors w/ resetOnSubmit', async () => {});

  test('submitError w/ resetOnSubmit', async () => {});
});

describe('submit render states', () => {
  test('submit failed', () => {});

  test('submit succeeded', () => {});

  test('submit failed w/ text', () => {});

  test('is submitting', () => {});
});

describe('submit render states', () => {
  const inputs = {
    firstName: { required: true },
    lastName: { required: true },
  };

  const initialValues = {
    firstName: 'Charlie',
    lastName: 'Jones',
  };

  const AptformUnit = (props: *) => (
    <Aptform {...defaultProps} inputs={inputs} initialValues={initialValues} {...props} />
  );

  test('submit succeeded', async () => {
    let form;
    const renderMock = jest.fn(renderProps => {
      form = renderProps.form;
      return toStableJSON(form);
    });

    const onSubmitMock = jest.fn(() => Promise.resolve());
    const { getByText } = render(<AptformUnit render={renderMock} onSubmit={onSubmitMock} />);

    // initial form state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":false}'
      )
    );

    triggerSubmit(form);
    expect(onSubmitMock).toHaveBeenCalled();

    // submitting state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":true}'
      )
    );

    // submitting resolved => not in submitting state, resets previous submit state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":false}'
      )
    );

    // submitting succeeded
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":true,"submitting":false}'
      )
    );
  });

  test('submit failed', async () => {
    let form;
    const renderMock = jest.fn(renderProps => {
      form = renderProps.form;
      return toStableJSON(form);
    });

    const onSubmitMock = jest.fn(() => Promise.resolve({ submitError: true }));
    const { getByText } = render(<AptformUnit render={renderMock} onSubmit={onSubmitMock} />);

    // initial form state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":false}'
      )
    );

    triggerSubmit(form);
    expect(onSubmitMock).toHaveBeenCalled();

    // submitting state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":true}'
      )
    );

    // submitting failed
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"Unknown error ocurred.","submitFailed":true,"submitSucceeded":false,"submitting":false}'
      )
    );
  });
});

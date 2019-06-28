// @flow

import React from 'react';
import { render, waitForElement, cleanup, fireEvent } from '@testing-library/react';

import { Aptform } from '../src/index';

import { defaultProps, toStableJSON as toJSON } from './helpers';

describe('form.onSubmit defensivity', () => {
  beforeEach(() => {
    global.console.warn = jest.fn();
  });

  afterEach(() => {
    global.console.warn.mockRestore();
    cleanup();
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
  afterEach(() => {
    cleanup();
  });

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
      const renderMock = jest.fn(({ inputs, form }) => {
        const { firstName, lastName } = inputs;
        return (
          <form {...form.getPassProps()}>
            <input {...firstName.getPassProps()} />
            <input {...lastName.getPassProps()} />
            <article>{`firstName: ${firstName.value}; lastName: ${lastName.value}`}</article>
          </form>
        );
      });

      const onSubmitMock = jest.fn(() => Promise.resolve(resolveValue));
      const { getByText, container } = render(
        <Aptform
          {...defaultProps}
          render={renderMock}
          onSubmit={onSubmitMock}
          inputs={inputs}
          initialValues={initialValues}
          config={{ resetOnSubmit: true }}
        />
      );

      const formEl = container.querySelector('form');
      const firstNameEl = container.querySelector('input[name="firstName"]');
      fireEvent.change(firstNameEl, { target: { name: 'firstName', value: 'Karlik' } });

      await waitForElement(() => getByText('firstName: Karlik; lastName: Jones'));

      fireEvent.submit(formEl);

      expect(onSubmitMock).toHaveBeenCalled();

      await waitForElement(() => getByText('firstName: Charlie; lastName: Jones'));
    }
  });

  test('data => updates input values', async () => {
    // it resets the form with new values

    const renderMock = jest.fn(({ form, inputs }) => {
      const { firstName, lastName } = inputs;
      return (
        <form {...form.getPassProps()}>
          <input {...firstName.getPassProps()} />
          <input {...lastName.getPassProps()} />

          <article>{`firstName: ${firstName.value}; lastName: ${lastName.value}`}</article>
        </form>
      );
    });

    const onSubmitMock = jest.fn(() =>
      Promise.resolve({ data: { firstName: 'Zoe', lastName: 'Williams' } })
    );
    const { getByText, container } = render(
      <Aptform
        {...defaultProps}
        render={renderMock}
        onSubmit={onSubmitMock}
        inputs={inputs}
        initialValues={initialValues}
        config={{ resetOnSubmit: true }}
      />
    );

    const formEl = container.querySelector('form');
    const firstNameEl = container.querySelector('input[name="firstName"]');

    fireEvent.change(firstNameEl, { target: { name: 'firstName', value: 'Karlik' } });

    await waitForElement(() => getByText('firstName: Karlik; lastName: Jones'));

    fireEvent.submit(formEl);

    fireEvent.change(firstNameEl, { target: { name: 'firstName', value: 'Karlik' } });

    expect(onSubmitMock).toHaveBeenCalled();

    // - it ignores the resetOnSubmit config
    // - the changed value Karlik is discarded
    // - the initial value Charlie is discarded
    await waitForElement(() => getByText('firstName: Zoe; lastName: Williams'));
  });
});

describe('onSubmit resolved => errors', () => {
  afterEach(() => {
    cleanup();
  });

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
    const renderMock = jest.fn(({ inputs, form }) => {
      const { nameHandle, username } = inputs;
      return (
        <form {...form.getPassProps()}>
          <article>
            nameHandle error: {nameHandle.errorText}; username error: {username.errorText}; submit
            failed: {String(form.submitFailed)}
          </article>
        </form>
      );
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

    const formEl = container.querySelector('form');

    fireEvent.submit(formEl);
    expect(onSubmitMock).toHaveBeenCalled();

    // then: submit errors (mapped to text)
    await waitForElement(() =>
      getByText(
        'nameHandle error: do not use special characters; username error: user already taken; submit failed: true'
      )
    );
  });

  // $FlowFixMe (each)
  test.each([
    ['true', true, 'Unknown error ocurred.'],
    // ['empty', '', 'Unknown error ocurred.'],
    ['literal code', 'unknownError', 'Unknown error ocurred.'],
    // ['random code', 'WHAT-EVER-ERROR', 'Unknown error ocurred.'],
  ])('submitError: %s', async (msg, submitError, submitErrorText) => {
    const renderMock = jest.fn(({ form, inputs }) => {
      return (
        <form {...form.getPassProps()}>
          {toJSON({ submitFailed: form.submitFailed, submitErrorText: form.submitErrorText })}
        </form>
      );
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
    expect(container.textContent).toBe(toJSON({ submitFailed: false, submitErrorText: '' }));

    const formEl = container.querySelector('form');

    fireEvent.submit(formEl);
    expect(onSubmitMock).toHaveBeenCalled();

    // then: submit failed
    await waitForElement(() =>
      getByText(toJSON({ submitFailed: true, submitErrorText: submitErrorText }))
    );

    renderMock.mockRestore();
  });

  test('errors w/ resetOnSubmit', async () => {});

  test('submitError w/ resetOnSubmit', async () => {});
});

describe('submit render states', () => {
  afterEach(() => {
    cleanup();
  });

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
    const renderMock = jest.fn(({ form }) => {
      return <form {...form.getPassProps()}>{toJSON(form)}</form>;
    });

    const onSubmitMock = jest.fn(() => Promise.resolve());
    const { getByText, container } = render(
      <AptformUnit render={renderMock} onSubmit={onSubmitMock} />
    );

    // initial form state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":false}'
      )
    );

    const formEl = container.querySelector('form');
    fireEvent.submit(formEl);

    expect(onSubmitMock).toHaveBeenCalled();

    // is in submitting state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":true}'
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
    const renderMock = jest.fn(({ form }) => {
      return <form {...form.getPassProps()}>{toJSON(form)}</form>;
    });

    const onSubmitMock = jest.fn(() => Promise.resolve({ submitError: true }));
    const { getByText, container } = render(
      <AptformUnit render={renderMock} onSubmit={onSubmitMock} />
    );

    // initial form state
    await waitForElement(() =>
      getByText(
        '{"submitErrorText":"","submitFailed":false,"submitSucceeded":false,"submitting":false}'
      )
    );

    const formEl = container.querySelector('form');
    fireEvent.submit(formEl);
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

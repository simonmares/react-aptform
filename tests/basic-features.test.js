// @flow

import * as React from 'react';
import { render } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps } from './helpers';

test('renders what returns `render` prop', () => {
  const renderMock = jest.fn(() => <div>Rendered</div>);
  const { container } = render(<Aptform {...defaultProps} render={renderMock} />);
  expect(renderMock).toHaveBeenCalled();
  expect(container.textContent).toBe('Rendered');
});

test('`render` prop receives `form` prop with given API', () => {
  // This tests also form default state.

  const renderMock = jest.fn(({ form }) => {
    expect(form.getPassProps).toBeDefined();
    expect(form.onSubmit).toBeDefined();
    expect(form.onFocus).toBeDefined();
    expect(form.onBlur).toBeDefined();
    expect(form.changeInput).toBeDefined();
    expect(form.focusInput).toBeDefined();
    expect(form.blurInput).toBeDefined();
    expect(form.submitting).toBe(false);
    // experimental:
    expect(form.isSubmitting()).toBe(false);
    expect(form.hasChanged()).toBe(false);
    return null;
  });
  render(<Aptform {...defaultProps} render={renderMock} />);
});

test('`render` prop receives `inputs` prop', () => {
  const inputsConfig = {
    name: {},
    email: {},
  };

  const initialValues = {
    name: '',
    email: '',
  };

  const renderMock = jest.fn(({ inputs }) => {
    expect(Object.keys(inputs)).toEqual(Object.keys(inputsConfig));

    const inputEmail = inputs.email;
    expect(inputEmail.name).toEqual('email');
    expect(inputEmail._serverErrors).toEqual(undefined);
    expect(inputEmail.value).toEqual('');
    expect(inputEmail.errorText).toEqual('');
    expect(inputEmail.clientErrors).toEqual({});

    // boolean
    expect(inputEmail.valid).toEqual(true);
    expect(inputEmail.touched).toEqual(false);
    expect(inputEmail.focused).toEqual(false);
    expect(inputEmail.pristine).toEqual(true);
    expect(inputEmail.changing).toEqual(false);

    // boolean API
    expect(inputEmail.hasChanged()).toEqual(false);
    expect(inputEmail.hasError()).toEqual(false);

    // pass props
    const passProps = inputEmail.getPassProps();
    expect(passProps.onChange).toBeDefined();
    expect(passProps.value).toEqual('');
    expect(passProps.name).toEqual('email');
    expect(passProps.required).toEqual(false);

    return null;
  });

  render(
    <Aptform
      {...defaultProps}
      initialValues={initialValues}
      inputs={inputsConfig}
      render={renderMock}
    />
  );
});

test('inputs have initial values if provided', () => {
  const inputsConfig = {
    name: {},
    email: {},
    phone: {},
  };

  const initialValues = {
    name: 'Paola Moreno',
    email: 'paola.moreno@example.com',
  };

  const renderMock = jest.fn(({ inputs }) => {
    const { email: inputEmail, name: inputName, phone: inputPhone } = inputs;

    expect(inputEmail.name).toEqual('email');
    expect(inputEmail.value).toEqual('paola.moreno@example.com');

    expect(inputName.name).toEqual('name');
    expect(inputName.value).toEqual('Paola Moreno');

    // No initial value => has default value
    expect(inputPhone.name).toEqual('phone');
    expect(inputPhone.value).toEqual('');

    return null;
  });

  render(
    <Aptform
      {...defaultProps}
      inputs={inputsConfig}
      initialValues={initialValues}
      render={renderMock}
    />
  );
});

describe('validates props on development', () => {
  // Errors are logged to `console.warn` which is mocked before each test.

  beforeEach(() => {
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  });

  afterEach(() => {
    global.console.warn.mockRestore();
    global.console.error.mockRestore();
  });

  test('warn `children` prop passed', () => {
    const props = { ...defaultProps };
    render(<Aptform {...props}>No way!</Aptform>);
    expect(console.warn).toBeCalledWith('Aptform does not accept children prop.');
  });

  test('required prop `render` is passed', () => {
    const invalidProps = { ...defaultProps };
    delete invalidProps.render;
    // Using it as a function should resolve with TypeError
    expect(() => {
      render(<Aptform {...invalidProps} />);
    }).toThrow();
    // Using missing prop is logged to console
    expect(console.warn).toBeCalledWith(expect.stringMatching(/Prop `render` is missing./));
  });

  test('validates required prop `inputs` is passed', () => {
    const invalidProps = { ...defaultProps };
    delete invalidProps.inputs;
    // Using it as an object should resolve with TypeError
    expect(() => {
      render(<Aptform {...invalidProps} />);
    }).toThrow();
    // Using missing prop is logged to console
    expect(console.warn).toBeCalledWith(expect.stringMatching(/Prop `inputs` is missing./));
  });

  test('validates inputs and initialValues mismatches', () => {
    const invalidProps = {
      ...defaultProps,
      inputs: { name: { required: true }, email: { required: true } },
      initialValues: { firstName: '', lastName: '', email: '' },
    };
    render(<Aptform {...invalidProps} />);
    expect(console.warn).toBeCalledWith(
      expect.stringMatching(
        /Extra keys in `initialValues`: \[firstName, lastName\] missing in `inputs`./
      )
    );
  });
});

test.skip('clear all timers on unmount', () => {
  const clearAllTimersSpy = jest.spyOn(Aptform.prototype, 'clearAllTimers');
  const { unmount } = render(<Aptform {...defaultProps} />);
  unmount();
  expect(clearAllTimersSpy).toHaveBeenCalled();
});

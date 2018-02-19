// @flow

import React from 'react';
import { shallow } from 'enzyme';

import { FormValues } from '../src/index';

import { defaultProps } from './helpers';

test('renders what returns `render` prop', () => {
  const renderMock = jest.fn(() => <div />);
  const wrapper = shallow(<FormValues {...defaultProps} render={renderMock} />);
  expect(renderMock).toHaveBeenCalled();
  expect(wrapper.equals(<div />)).toBe(true);
});

test('`render` prop receives `form` prop', () => {
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
    return null;
  });
  shallow(<FormValues {...defaultProps} render={renderMock} />);
});

test('`render` prop receives `inputs` prop', () => {
  // This tests also inputs default state.

  const inputsConfig = {
    name: {},
    email: {},
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
    expect(inputEmail.valid).toEqual(undefined);
    expect(inputEmail.touched).toEqual(false);
    expect(inputEmail.focused).toEqual(false);
    expect(inputEmail.pristine).toEqual(true);
    expect(inputEmail.changing).toEqual(false);

    // boolean API
    expect(inputEmail.hasChanged()).toEqual(false);

    // pass props
    const passProps = inputEmail.getPassProps();
    expect(passProps.onChange).toBeDefined();
    expect(passProps.value).toEqual('');
    expect(passProps.name).toEqual('email');
    expect(passProps.required).toEqual(false);

    return null;
  });
  shallow(<FormValues {...defaultProps} inputs={inputsConfig} render={renderMock} />);
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

  shallow(
    <FormValues
      {...defaultProps}
      inputs={inputsConfig}
      initialValues={initialValues}
      render={renderMock}
    />
  );
});

test('inputs can be dynamic', () => {
  // When setting inputsAreDynamic prop, it should pass `inputs` to `render` with
  // reflecting actual inputs.
  const inputsConfig = { email: {}, password: {} };

  const renderMock = jest.fn(({ inputs }) => {
    const { email, password } = inputs;
    expect(email.name).toEqual('email');
    expect(password.name).toEqual('password');
    return null;
  });

  const wrapper = shallow(
    <FormValues inputsAreDynamic {...defaultProps} inputs={inputsConfig} render={renderMock} />
  );

  const inputsConfigNoEmail = { ...inputsConfig };
  delete inputsConfigNoEmail.password;

  const renderMock2 = jest.fn(({ inputs }) => {
    const { email, password } = inputs;
    expect(email).toBeDefined();
    expect(password).toBeUndefined();
    return null;
  });
  wrapper.setProps({ inputs: inputsConfigNoEmail, render: renderMock2 });
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

  test('validates `onSubmit` or `syncToStore` props must be passed', () => {
    const invalidProps = {
      ...defaultProps,
    };
    delete invalidProps.syncToStore;
    delete invalidProps.onSubmit;

    shallow(<FormValues {...invalidProps} />);
    expect(console.warn).toBeCalledWith('You either have to provide onSubmit prop or syncToStore.');
  });

  test('warn `children` prop passed', () => {
    const props = { ...defaultProps };
    shallow(<FormValues {...props}>No way!</FormValues>);
    expect(console.warn).toBeCalledWith('FormValues does not accept children prop.');
  });

  test('warn `errorText` and `getErrorFromMap` props passed together', () => {
    const props = { ...defaultProps };
    shallow(<FormValues {...props} errorText={() => {}} getErrorFromMap={() => {}} />);
    expect(console.warn).toBeCalledWith('You should provide either errorText or getErrorFromMap.');
  });

  test('validates required props are passed', () => {
    {
      const invalidProps = { ...defaultProps };
      delete invalidProps.render;
      // Using it as a function should resolve with TypeError
      expect(() => {
        shallow(<FormValues {...invalidProps} />);
      }).toThrow(expect.stringMatching(/render is not a function/));
      // Using missing prop is logged to console
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/The prop `render` is marked as required in `FormValues`/)
      );
    }
    {
      const invalidProps = { ...defaultProps };
      delete invalidProps.inputs;
      // Using it as an object should resolve with TypeError
      expect(() => {
        shallow(<FormValues {...invalidProps} />);
      }).toThrow(expect.stringMatching(/TypeError: Cannot convert undefined or null to object/));
      // Using missing prop is logged to console
      expect(console.error).toBeCalledWith(
        expect.stringMatching(/The prop `inputs` is marked as required in `FormValues`/)
      );
    }
  });
});

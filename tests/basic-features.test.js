// @flow

import React from 'react';
import { shallow } from 'enzyme';

import { Aptform } from '../src/index';

import { defaultProps } from './helpers';

test('renders what returns `render` prop', () => {
  const renderMock = jest.fn(() => <div />);
  const wrapper = shallow(<Aptform {...defaultProps} render={renderMock} />);
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
  shallow(<Aptform {...defaultProps} render={renderMock} />);
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

    // pass props
    const passProps = inputEmail.getPassProps();
    expect(passProps.onChange).toBeDefined();
    expect(passProps.value).toEqual('');
    expect(passProps.name).toEqual('email');
    expect(passProps.required).toEqual(false);

    return null;
  });
  shallow(
    <Aptform
      {...defaultProps}
      initialValues={initialValues}
      inputs={inputsConfig}
      render={renderMock}
    />
  );
});

// NotePrototype(simon): initialValues are required atm
test.skip('inputs have initial values if provided', () => {
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
    shallow(<Aptform {...props}>No way!</Aptform>);
    expect(console.warn).toBeCalledWith('Aptform does not accept children prop.');
  });

  test('required prop `render` is passed', () => {
    const invalidProps = { ...defaultProps };
    delete invalidProps.render;
    // Using it as a function should resolve with TypeError
    expect(() => {
      shallow(<Aptform {...invalidProps} />);
    }).toThrow();
    // Using missing prop is logged to console
    expect(console.warn).toBeCalledWith(expect.stringMatching(/Prop render is missing./));
  });

  // NoteReview(simon): atm initialValues are required only
  test.skip('validates required prop `inputs` is passed', () => {
    const invalidProps = { ...defaultProps };
    delete invalidProps.inputs;
    // Using it as an object should resolve with TypeError
    expect(() => {
      shallow(<Aptform {...invalidProps} />);
    }).toThrow();
    // Using missing prop is logged to console
    expect(console.warn).toBeCalledWith(expect.stringMatching(/Prop inputs is missing./));
  });
});

// @flow

import React from 'react';
import { shallow, mount } from 'enzyme';
import sinon from 'sinon';

import { FormValues, FormStore } from '../index';
import { defaultProps } from './helpers';

describe('warnings', () => {
  beforeEach(() => {
    global.console.warn = jest.fn();
  });

  afterEach(() => {
    global.console.warn.mockRestore();
  });

  test('it warns if syncToStore is true but FormStore is not found', () => {
    // NOTE_REVIEW: this is a subject to change
    const renderMock = jest.fn(() => null);

    shallow(<FormValues syncToStore {...defaultProps} render={renderMock} />);

    expect(renderMock).toHaveBeenCalled();
    expect(console.warn).toBeCalledWith(
      'You passed syncToStore but FormStore was not found in component tree.'
    );
  });

  test('it warns if children prop is provided', () => {
    const renderMock = jest.fn(() => null);
    shallow(
      <FormStore render={renderMock}>
        <FormValues syncToStore {...defaultProps} />
      </FormStore>
    );
    expect(console.warn).toBeCalledWith('FormStore does not accept children prop.');
  });
});

describe('lifecycle checks', () => {
  let onRegisterFormSpy;
  let onUnregisterFormSpy;

  beforeEach(() => {
    onRegisterFormSpy = jest.spyOn(FormStore.prototype, 'onRegisterForm');
    onUnregisterFormSpy = jest.spyOn(FormStore.prototype, 'onUnregisterForm');
  });

  afterEach(() => {
    onRegisterFormSpy.mockRestore();
    onUnregisterFormSpy.mockRestore();
  });

  test('it should register/unregister self on mount/unmount', () => {
    const renderMock = jest.fn(() => <FormValues syncToStore {...defaultProps} />);

    const wrapper = mount(<FormStore render={renderMock} />);

    expect(renderMock).toHaveBeenCalled();
    expect(onRegisterFormSpy).toHaveBeenCalled();

    wrapper.unmount();
    expect(onUnregisterFormSpy).toHaveBeenCalled();
  });
});

describe('title', () => {
  let onRegisterFormSpy;
  let onUnregisterFormSpy;

  beforeEach(() => {
    onRegisterFormSpy = jest.spyOn(FormStore.prototype, 'onRegisterForm');
    onUnregisterFormSpy = jest.spyOn(FormStore.prototype, 'onUnregisterForm');
  });

  afterEach(() => {
    onRegisterFormSpy.mockRestore();
    onUnregisterFormSpy.mockRestore();
  });
});

test('FormValues syncs to FormStore', async () => {
  const receivedProps = {
    // FormValues API
    inputs: {},
    form: {},

    // FormStore API
    getForm: name => {
      throw new Error('Should not be called.');
    },
    getAllForms: () => {
      throw new Error('Should not be called.');
    },
  };

  const renderFormValues = jest.fn(({ form, inputs }) => {
    receivedProps.inputs = inputs;
    receivedProps.form = form;
    return null;
  });

  const renderFormStore = jest.fn(props => {
    receivedProps.getForm = props.getForm;
    receivedProps.getAllForms = props.getAllForms;

    return (
      <FormValues
        id="users123"
        syncToStore
        {...defaultProps}
        render={renderFormValues}
        inputs={{ name: {}, email: {} }}
      />
    );
  });

  const setInputStateSpy = sinon.spy(FormValues.prototype, 'setInputState');

  const wrapper = mount(<FormStore render={renderFormStore} />);

  expect(renderFormValues).toHaveBeenCalled();
  expect(renderFormStore).toHaveBeenCalled();

  //
  // Test:
  // - value is synced to the store
  // - form values can get retrieved via the API (getForm, getAllForms)
  //
  {
    // Lets change to verify the actual value was synced...
    const { changeInput, blurInput } = receivedProps.form;
    changeInput('name', 'Paola');
    // we must trigger blur "event" to sync
    blurInput('name');

    await setInputStateSpy.returnValues.pop();
    wrapper.update();

    const { getForm } = receivedProps;
    const users123form = getForm('users123');

    // Assert it was synced
    expect(users123form['name']).toEqual('Paola');

    // Assert we get correct form
    expect(users123form['email']).toEqual('');

    // Assert we can get the form from a map of all forms
    const { getAllForms } = receivedProps;
    const allForms = getAllForms();
    expect(allForms['users123']).toEqual(users123form);
  }

  //
  // Test:
  // - using onChange and onBlur
  // - different input name
  //
  {
    const { onChange } = receivedProps.inputs.email;
    const { onBlur } = receivedProps.form;
    onChange && onChange({ target: { name: 'email', value: 'paola@example.com' } });
    onBlur && onBlur({ target: { name: 'email' } });

    await setInputStateSpy.returnValues.pop();
    wrapper.update();

    const { getForm } = receivedProps;
    const users123form = getForm('users123');

    // Assert it was synced
    expect(users123form['email']).toEqual('paola@example.com');
  }
});

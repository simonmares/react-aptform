// @flow

import React from 'react';
import { shallow, mount } from 'enzyme';

import { FormValues, ConfigureForms } from '../index';
import { defaultProps } from './helpers';

import type { FormConfig } from '../apt-form-flow.d';

test('FormValues defaults to config from context if provided', () => {
  const globalConfig: FormConfig = {
    typeTimeout: 1234,
    failFast: true,
    msgInvalid: 'Test: Invalid input.',
  };

  const renderMock = jest.fn(() => null);
  const wrapper = shallow(<FormValues {...defaultProps} render={renderMock} />, {
    context: {
      aptFormConfig: globalConfig,
    },
  });

  const inst = wrapper.instance();
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(1234);
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('Test: Invalid input.');
  expect(renderMock).toHaveBeenCalled();
});

const defaultConfig = {
  typeTimeout: 650,
  failFast: false,
  msgInvalid: 'This input is invalid.',
};

test('FormValues fallbacks to default props', () => {
  const renderMock = jest.fn(() => null);
  const wrapper = shallow(<FormValues {...defaultProps} render={renderMock} />);
  const inst = wrapper.instance();
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(defaultConfig.typeTimeout);
  expect(inst.getFormConfigVal('failFast')).toEqual(defaultConfig.failFast);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual(defaultConfig.msgInvalid);
  expect(renderMock).toHaveBeenCalled();
});

test('FormValues default props can be overriden by passing config prop', () => {
  const renderMock = jest.fn(() => null);

  const wrapper = shallow(
    <FormValues {...defaultProps} render={renderMock} config={{ typeTimeout: 333 }} />
  );
  const inst = wrapper.instance();
  // Overriden
  // Its works for every keys in the same way, so we don't have to test all of them
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(333);
  // Kept same
  expect(inst.getFormConfigVal('failFast')).toEqual(defaultConfig.failFast);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual(defaultConfig.msgInvalid);
  expect(renderMock).toHaveBeenCalled();
});

test('FormValues config prop has precedence over global config', () => {
  const renderMock = jest.fn(() => null);

  const context = {
    aptFormConfig: {
      typeTimeout: 444,
    },
  };

  const wrapper = shallow(
    <FormValues {...defaultProps} render={renderMock} config={{ typeTimeout: 555 }} />,
    { context }
  );
  const inst = wrapper.instance();
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(555);
});

test('FormValues integreted with ConfigureForms', () => {
  const renderMock = jest.fn(() => null);

  const configureWrapper = mount(
    <ConfigureForms typeTimeout={666} failFast msgInvalid={'test (global config): Not valid.'}>
      <FormValues {...defaultProps} render={renderMock} />
    </ConfigureForms>
  );
  const wrapper = configureWrapper.children();
  const inst = wrapper.instance();

  expect(inst.getFormConfigVal('typeTimeout')).toEqual(666);
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('test (global config): Not valid.');
});

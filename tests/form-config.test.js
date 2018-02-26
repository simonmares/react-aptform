// @flow

import React from 'react';
import { mount } from 'enzyme';

import { preconfigure, FormValues, ConfigureForm } from '../src/index';

import { defaultProps } from './helpers';

import type { FormConfig } from '../src/apt-form-flow.d';

test('it fallbacks to all preconfigured values', () => {
  // Desc: no config prop was passed, so it should fallback to all the values
  // provided below.

  const preconfig: FormConfig = {
    typeTimeout: 1234,
    failFast: true,
    msgInvalid: 'Test: Invalid input.',
  };

  const FormValuesConfigured = preconfigure(preconfig);

  let inst;
  mount(
    <FormValuesConfigured
      componentRef={ref => {
        inst = ref;
      }}
      {...defaultProps}
    />
  );

  if (!inst) {
    throw new Error('Expected inst to be defined by componentRef.'); // for flow mostly
  }

  expect(inst.getFormConfigVal('typeTimeout')).toEqual(1234);
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('Test: Invalid input.');
});

test('FormValues fallbacks to default props', () => {
  // Desc: no values were passed to preconfigure so it does do anything effectively (but
  // does not break default props config either).

  const FormValuesConfigured = preconfigure();

  let inst;
  mount(
    <FormValuesConfigured
      componentRef={ref => {
        inst = ref;
      }}
      {...defaultProps}
    />
  );

  if (!inst) {
    throw new Error('Expected inst to be defined by componentRef.'); // for flow mostly
  }

  const defaultConfig = FormValues.defaultProps.config;
  // Note: test what is default for test clarity
  expect(defaultConfig).toEqual({
    typeTimeout: 650,
    failFast: false,
    msgInvalid: 'This input is invalid.',
  });

  expect(inst.getFormConfigVal('typeTimeout')).toEqual(650);
  expect(inst.getFormConfigVal('failFast')).toEqual(false);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('This input is invalid.');
});

test('default props config can be overriden by passing config prop', () => {
  const wrapper = mount(<FormValues {...defaultProps} config={{ typeTimeout: 333 }} />);

  const inst = wrapper.instance();
  // const { config: finalConfig } = inst.props;

  // Note: works same for any key, so test just one:
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(333);

  // these fields were not intacted:
  const defaultConfig = FormValues.defaultProps.config;
  expect(inst.getFormConfigVal('failFast')).toEqual(defaultConfig.failFast);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual(defaultConfig.msgInvalid);
});

test('FormValues config prop has precedence over global config', () => {
  const FormValuesConfigured = preconfigure({ typeTimeout: 444 });

  let inst;
  mount(
    <FormValuesConfigured
      {...defaultProps}
      componentRef={ref => {
        inst = ref;
      }}
      config={{ typeTimeout: 555 }}
    />
  );

  if (!inst) {
    throw new Error('Expected inst to be defined by componentRef.'); // for flow mostly
  }

  expect(inst.getFormConfigVal('typeTimeout')).toEqual(555);
});

test('FormValues use with ConfigureForm', () => {
  const configureWrapper = mount(
    <ConfigureForm typeTimeout={666} failFast msgInvalid={'test (global config): Not valid.'}>
      <FormValues {...defaultProps} config={{ typeTimeout: 1234 }} />
    </ConfigureForm>
  );

  const wrapper = configureWrapper.children();
  const inst = wrapper.instance();

  // specific
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(1234);
  // ...
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('test (global config): Not valid.');
});

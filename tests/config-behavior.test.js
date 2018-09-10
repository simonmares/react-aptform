// @flow

import * as React from 'react';
import { render } from 'react-testing-library';

import { preconfigure, Aptform } from '../src/index';

import { defaultProps } from './helpers';

import type { FormConfig } from '../src/types.d';

const defaultConfig = {
  typeTimeout: 650,
  asyncTimeout: 500,
  failFast: false,
  resetOnSubmit: true,
  msgInvalid: 'This input is invalid.',
  msgFormInvalid: 'Form has errors.',
  msgUnknownError: 'Unknown error ocurred.',
};

test('it fallbacks to all preconfigured values', () => {
  // Desc: no config prop was passed, so it should fallback to all the values
  // provided below.

  const preconfig: FormConfig = {
    typeTimeout: 1234,
    asyncTimeout: 432,
    failFast: true,
    resetOnSubmit: false,
    msgInvalid: 'Test: Invalid input.',
  };

  const AptformConfigured = preconfigure(preconfig);

  let inst;
  render(
    <AptformConfigured
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
  expect(inst.getFormConfigVal('asyncTimeout')).toEqual(432);
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('resetOnSubmit')).toEqual(false);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('Test: Invalid input.');
});

test('Aptform fallbacks to default props', () => {
  // Desc: no values were passed to preconfigure so it does do anything effectively (but
  // does not break default props config either).

  const AptformConfigured = preconfigure();

  let inst;
  render(
    <AptformConfigured
      componentRef={ref => {
        inst = ref;
      }}
      {...defaultProps}
    />
  );

  if (!inst) {
    throw new Error('Expected inst to be defined by componentRef.'); // for flow mostly
  }

  for (const key of Object.keys(defaultConfig)) {
    const val = defaultConfig[key];
    expect(inst.getFormConfigVal(key)).toEqual(val);
  }
});

test('default props config can be overriden by passing config prop', () => {
  const ref = React.createRef();
  render(<Aptform ref={ref} {...defaultProps} config={{ typeTimeout: 333 }} />);

  const inst = ref.current;
  expect(inst).toBeDefined();
  if (!inst) {
    return;
  }

  // Note: works same for any key, so test just one:
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(333);

  // these fields were not intacted:
  expect(inst.getFormConfigVal('failFast')).toEqual(defaultConfig.failFast);
  expect(inst.getFormConfigVal('msgInvalid')).toEqual(defaultConfig.msgInvalid);
});

test('Aptform config prop has precedence over global config', () => {
  const AptformConfigured = preconfigure({ typeTimeout: 444 });

  let inst;
  render(
    <AptformConfigured
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

test('all cases', () => {
  const AptformConfigured = preconfigure({ typeTimeout: 444, failFast: true });

  let inst;
  render(
    <AptformConfigured
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

  // from specific config
  expect(inst.getFormConfigVal('typeTimeout')).toEqual(555);
  expect(inst.getFormConfigVal('typeTimeout')).not.toEqual(defaultConfig.typeTimeout);
  // from the preconfiguration
  expect(inst.getFormConfigVal('failFast')).toEqual(true);
  expect(inst.getFormConfigVal('failFast')).not.toEqual(defaultConfig.failFast);
  // from the defaultProps
  expect(inst.getFormConfigVal('msgInvalid')).toEqual('This input is invalid.');
  expect(inst.getFormConfigVal('msgInvalid')).toEqual(defaultConfig.msgInvalid);
});

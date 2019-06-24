// @flow

import * as React from 'react';
import { render, waitForElement } from '@testing-library/react';

import { createChangeEvent } from '../helpers';

import { Aptform } from '../../src/index';

function createPerfContainer(amount) {
  const inputs = {};
  const initialValues = {};

  for (let i = 0; i < amount; i++) {
    const name = `field_${i}`;
    inputs[name] = { required: false };
    initialValues[name] = `input value #${i}`;
  }

  const onSubmit = () => Promise.resolve();

  class PerfContainer extends React.Component<{ render: (*, *) => React.Node }, *> {
    renderTimes = 0;

    render() {
      return (
        <Aptform
          inputs={inputs}
          onSubmit={onSubmit}
          render={(renderProps) => {
            this.renderTimes += 1;
            return this.props.render(renderProps, this.renderTimes);
          }}
        />
      );
    }
  }

  return PerfContainer;
}

describe('no custom rendering', () => {
  test('initial setup', async () => {
    const FormContainer = createPerfContainer(1000);

    const startTime = new Date();
    const { getByText } = render(
      <FormContainer
        render={(renderProps, renderTimes) => {
          return <div>Rendered #{renderTimes} time.</div>;
        }}
      />
    );
    await waitForElement(() => getByText('Rendered #1 time.'));
    const endTime = new Date();

    const spentTime = endTime.getTime() - startTime.getTime();
    expect(spentTime).toBeLessThanOrEqual(60);
  });

  test('rerendering', async () => {
    const FormContainer = createPerfContainer(1000);

    const startTime = new Date();

    let inputs = {};
    const { getByText } = render(
      <FormContainer
        render={(renderProps, renderTimes) => {
          inputs = renderProps.inputs;
          return <div>Rendered #{renderTimes} time.</div>;
        }}
      />
    );

    await waitForElement(() => getByText('Rendered #1 time.'));

    const someInput = inputs.field_500;
    const e = createChangeEvent({ name: 'field_500', value: 'field 500 value' });
    someInput.onChange(e);

    await waitForElement(() => getByText('Rendered #2 time.'));

    const endTime = new Date();

    const spentTime = endTime.getTime() - startTime.getTime();
    expect(spentTime).toBeLessThanOrEqual(160);
  });
});

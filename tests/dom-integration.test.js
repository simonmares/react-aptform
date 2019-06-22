// @flow

import React from 'react';
import { render, waitForElement, cleanup } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps, toStableJSON as toJSON, triggerBlur, triggerFocus } from './helpers';

// jest.setTimeout(1000);

function localRender({ inputs }: *) {
  // $FlowFixMe
  let form;
  const renderMock = jest.fn((renderProps) => {
    const { password } = renderProps.inputs;
    form = renderProps.form;
    return toJSON({
      touched: password.touched,
      focused: password.focused,
    });
  });

  const { getByText, container } = render(
    <Aptform {...defaultProps} inputs={inputs} render={renderMock} />
  );

  return { form, getByText, container };
}

const inputs = {
  password: {
    required: true,
  },
};

describe('events', () => {
  afterEach(() => {
    cleanup();
  });

  // test.only('blur event from buttons does NOT change touched property', async () => {
  //   const { form, getByText, container } = localRender({ inputs });
  //   expect(container.textContent).toBe(toJSON({ touched: false }));
  // ['submit', 'reset', 'button', 'menu']
  //   triggerBlur(form, 'password', { type: 'button' });
  //   await waitForElement(() => getByText(toJSON({ touched: false })));
  // });

  test('blur event changes touched property', async () => {
    const { form, getByText, container } = localRender({ inputs });
    expect(container.textContent).toBe(toJSON({ touched: false, focused: false }));
    triggerBlur(form, 'password');
    await waitForElement(() => getByText(toJSON({ touched: true, focused: false })));
  });

  test('focus event changes touched property', async () => {
    const { form, getByText, container } = localRender({ inputs });
    expect(container.textContent).toBe(toJSON({ touched: false, focused: false }));
    triggerFocus(form, 'password');
    await waitForElement(() => getByText(toJSON({ touched: false, focused: true })));
  });
});

// @flow

import * as React from 'react';
import { render, waitForElement } from 'react-testing-library';

import { Aptform } from '../src/index';

describe('form.onSubmit', () => {
  test('...', async () => {
    const { getByText, container } = render(
      <Aptform inputs={{ name: { required: false } }} render={() => <div>Rendered</div>} />
    );
    const renderedText = await waitForElement(() => getByText('Rendered'));
    expect(container.textContent).toBe('Rendered');
    expect(renderedText.textContent).toBe('Rendered');
  });
});

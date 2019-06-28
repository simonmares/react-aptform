// @flow

import { createForm } from './Form';

describe('Form', () => {
  test('can be initiated', () => {
    const inst = createForm({}, { initiallyValid: true });
    expect(inst).toBeDefined();
  });
});

// @flow

import { Aptform } from './Aptform';

describe('Aptform', () => {
  test('can be initiated', () => {
    const inst = new Aptform({ inputs: {} });
    expect(inst).toBeDefined();
  });
});

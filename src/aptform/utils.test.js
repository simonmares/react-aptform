// @flow

import * as utils from './utils';

describe('isButton', () => {
  test('basic', () => {
    const areButtons = [
      'button',
      // 'hidden',
      'reset',
      'submit',
      'menu',
    ];

    for (const _ of areButtons) {
      const element = { type: _ };
      // $FlowFixMe: the element is just a mock
      expect(utils.isButton(element)).toBe(true);
    }

    const notButtons = [
      'checkbox',
      'file',
      // 'hidden',
      'image',
      'password',
      'radio',
      'text',
      // special
      'email',
    ];

    for (const _ of notButtons) {
      const element = { type: _ };
      // $FlowFixMe: the element is just a mock
      expect(utils.isButton(element)).toBe(false);
    }
  });
});

describe('nonNilOrDefault', () => {
  test('basic', () => {
    const each = [
      ['', 'DEFAULT', ''],
      [null, 'DEFAULT', 'DEFAULT'],
      [undefined, 'DEFAULT', 'DEFAULT'],
      [0, 'DEFAULT', 0],
    ];

    for (const [val, def, expected] of each) {
      expect(utils.nonNil(val, def)).toBe(expected);
    }
  });
});

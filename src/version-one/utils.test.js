// @flow

import * as utils from './utils';

describe('getInputValue', () => {
  test('reads .value prop', () => {
    const element = { value: 'Ciao' };
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue(element)).toBe('Ciao');
  });

  test('reads .checked prop', () => {
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue({ checked: true, type: 'checkbox' })).toBe(true);
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue({ checked: false, type: 'checkbox' })).toBe(false);
  });

  test('reads from all numeric inputs number value', () => {
    const rangeElement = { type: 'range', value: '50' };
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue(rangeElement)).toBe(50);

    const numberElement = { type: 'number', value: '45' };
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue(numberElement)).toBe(45);

    // Note: it does not parse numeric value from text input
    const textElement = { type: 'text', value: '45' };
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue(textElement)).toBe('45');
  });

  test('handles NaN from a numeric input', () => {
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue({ type: 'number', value: '!' })).toBe(undefined);
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue({ type: 'number', value: '0' })).toBe(0);
    // $FlowFixMe: the element is just a mock
    expect(utils.getInputValue({ type: 'number', value: '!0' })).toBe(undefined);
  });
});

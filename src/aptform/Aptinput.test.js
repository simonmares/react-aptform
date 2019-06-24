// @flow

import { Aptinput } from './Aptinput';

describe('Aptinput initiate', () => {
  const createUnit = () => {
    return new Aptinput({ name: 'email' });
  };

  test('can be initiated', () => {
    const unit = createUnit();
    expect(unit).toBeDefined();
  });

  test('has initial empty state', () => {
    const unit = createUnit();
    expect(unit.state).toEqual({ value: '' });
  });
});

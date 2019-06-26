// @flow

import { Aptinput } from './Aptinput';

describe('Aptinput initiate', () => {
  const createUnit = (props) => {
    return new Aptinput({ name: 'email', ...props });
  };

  test('can be initiated', () => {
    const unit = createUnit();
    expect(unit).toBeDefined();
  });

  test('has initial empty state', () => {
    const unit = createUnit();
    expect(unit.state).toEqual({
      value: '',
      valid: undefined,
      touch: false,
      focus: false,
      pristine: true,
      changing: false,
      error: '',
    });
  });

  test('set initial state', () => {
    const initialState = {
      value: 'tom@example',
      valid: false,
      touch: true,
      focus: true,
      pristine: false,
      changing: true,
      error: 'This is not a valid e-mail.',
    };

    const unit = createUnit({
      initialState,
    });

    expect(unit.state).toEqual(initialState);
  });
});

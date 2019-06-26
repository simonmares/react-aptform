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

describe('internal', () => {
  const createUnit = (props) => {
    return new Aptinput({ name: 'email', ...props });
  };

  test('resolves passed props to internal', () => {
    const unit = createUnit();

    expect(unit.props).toEqual({
      name: 'email',
      // default value applied
      required: false,
    });
  });
});

describe('experimental', () => {
  const createUnit = (props) => {
    return new Aptinput({ name: 'email', ...props });
  };

  test('getPassProps', () => {
    const unit = createUnit();

    expect(unit.getPassProps()).toEqual({
      name: 'email',
      // default
      required: false,
      value: '',
    });
  });
});

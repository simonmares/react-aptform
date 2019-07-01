// @flow

import { createInput } from './Input';
import type { AptConfig } from './types';
import type { InputProps } from './Input';

const defaultConfig = {
  initiallyValid: undefined,
};

function createUnit(props: $Shape<InputProps> = {}, config: $Shape<AptConfig> = {}) {
  return createInput(props, {
    ...defaultConfig,
    ...config,
  });
}

describe('Input initiate', () => {
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  test('can be initiated', () => {
    const unit = createEmailInput();
    expect(unit).toBeDefined();
  });

  test('has initial empty state', () => {
    const unit = createEmailInput();
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
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  test('resolves passed props to internal', () => {
    const unit = createEmailInput();

    expect(unit.props).toEqual({
      name: 'email',
      // default value applied
      required: false,
    });
  });
});

describe('experimental', () => {
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  test('getPassProps', () => {
    const unit = createEmailInput();

    expect(unit.getPassProps()).toEqual({
      name: 'email',
      // default
      required: false,
      value: '',
    });
  });
});

describe('is API', () => {
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  test('w/ all defaults', () => {
    const unit = createEmailInput();
    expect(unit.is('valid')).toEqual(false);
    expect(unit.is('pristine')).toEqual(true);
    expect(unit.is('validating')).toEqual(true);
  });

  // test('is valid => undefined', () => {
  //   const unit = createEmailInput();
  //   expect(unit.is('valid')).toEqual(undefined);
  // });

  // test('is valid => true', () => {
  //   const unit = createEmailInput();
  // });

  // test('is valid => false', () => {});
});

describe('show API', () => {
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  test('w/ all defaults', () => {
    const unit = createEmailInput();
    expect(unit.show('success')).toEqual(false);
    expect(unit.show('error')).toEqual(false);
  });
});

describe('set API', () => {
  const createEmailInput = (props) => {
    return createUnit({ name: 'email', ...props });
  };

  const filterKeys = <TObj: {}>(obj: TObj, keys: $Keys<TObj>[]) => {
    let newObj = {};
    for (const k of keys) {
      newObj[k] = obj[k];
    }
    return newObj;
  };

  test('set: value', () => {
    const initialState = {
      pristine: true,
      value: 'nonsense@example.com',
      valid: false,
      error: 'This is nonsense',
    };
    const unit = createEmailInput({ initialState });
    expect(filterKeys(unit.dumpState(), ['pristine', 'value', 'valid', 'error'])).toEqual(
      initialState
    );

    unit.set('value', 'me@example.com');

    // test it resets other relevant state as well
    expect(filterKeys(unit.dumpState(), ['pristine', 'value', 'valid', 'error'])).toEqual({
      pristine: false,
      value: 'me@example.com',
      valid: undefined,
      error: '',
    });
  });

  test('set: error', () => {
    const initialState = {
      pristine: true,
      valid: true,
      error: 'This is old error',
    };
    const unit = createEmailInput({ initialState });
    expect(filterKeys(unit.dumpState(), ['pristine', 'valid', 'error'])).toEqual(initialState);

    unit.set('error', 'Server fresh error!');

    // test it resets other relevant state as well
    expect(filterKeys(unit.dumpState(), ['pristine', 'valid', 'error'])).toEqual({
      pristine: false,
      valid: false,
      error: 'Server fresh error!',
    });
  });
});

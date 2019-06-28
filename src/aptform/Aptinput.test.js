// @flow

import { createInput } from './Aptinput';
import type { AptConfig, AptinputProps } from './Aptinput';

const defaultConfig = {
  initiallyValid: undefined,
};

function createUnit(props: $Shape<AptinputProps> = {}, config: $Shape<AptConfig> = {}) {
  return createInput(props, {
    ...defaultConfig,
    ...config,
  });
}

describe('Aptinput initiate', () => {
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

// @flow

import { createForm } from './Form';
import type { FormProps } from './Form';
// import type { AptConfig } from './types';

function createUnit(props: $Shape<FormProps> = {}) {
  const defaultConfig = {
    initiallyValid: undefined,
  };
  const defaultProps = {
    inputs: {},
  };
  return createForm({
    ...defaultProps,
    ...props,
    config: {
      ...defaultConfig,
      ...props.config,
    },
  });
}

describe('Form (internal)', () => {
  test('can be initiated', () => {
    const unit = createUnit();
    expect(unit).toBeDefined();
  });
});

describe('Form initial state', () => {
  test('form state', () => {
    const unit = createUnit();
    expect(unit.is('valid')).toEqual(false);
    expect(unit.is('pristine')).toEqual(true);
    // NoteReview(simon): ...
    expect(unit.is('validating')).toEqual(true);
  });

  test('form inputs instances', () => {
    const unit = createUnit({
      inputs: {
        name: { required: true },
      },
    });
    const nameInput = unit.inputInstances.name;
    expect(nameInput).toBeDefined();
    expect(nameInput.props.required).toEqual(true);
  });
});

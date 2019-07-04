// @flow

import waitForExpect from 'wait-for-expect';

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

// time: 50 is an arbitrary value to test state changing asynchronously
function resolveLater(value, time = 50) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), time);
  });
}

describe('submit', () => {
  test('submit => done', async () => {
    const onSubmit = jest.fn(() => resolveLater(true));
    const inputs = { name: {} };
    const unit = createUnit({ onSubmit, inputs });

    let submitState = unit.state.submit;
    unit.subscribe(() => {
      submitState = unit.state.submit;
    });

    // initial state is: idle
    expect(submitState).toEqual('idle');

    unit.submit();

    // while submitting: pending
    await waitForExpect(() => {
      expect(submitState).toEqual('pending');
    });

    // done w/ success: done
    await waitForExpect(() => {
      expect(submitState).toEqual('done');
    });

    // verify onSubmit was passed the values
    expect(onSubmit).toBeCalledWith({ name: '' });
  });

  test('submit => failed', async () => {
    const onSubmit = jest.fn(() => resolveLater(false));
    const inputs = { name: {} };
    const unit = createUnit({ onSubmit, inputs });

    let submitState = unit.state.submit;
    unit.subscribe(() => {
      submitState = unit.state.submit;
    });

    // initial state is: idle
    expect(submitState).toEqual('idle');

    unit.submit();

    // while submitting: pending
    await waitForExpect(() => {
      expect(submitState).toEqual('pending');
    });

    // done w/ error: failed
    await waitForExpect(() => {
      expect(submitState).toEqual('failed');
    });

    // verify onSubmit was passed the values
    expect(onSubmit).toBeCalledWith({ name: '' });
  });
});

describe('reset', () => {
  test('reset => internal state', () => {
    const unit = createUnit();
    const initialState = { ...unit.state };

    expect(initialState).toEqual({
      valid: undefined,
      submit: 'idle',
      error: '',
      pristine: true,
      changing: false,
    });

    const changedState = {
      valid: false,
      submit: 'pending',
      error: 'Not valid',
      pristine: false,
      changing: true,
    };

    // verify its different
    for (const key of Object.keys(changedState)) {
      const val = changedState[key];
      expect(val).not.toEqual(initialState[key]);
    }

    unit._updateState(changedState);

    // verify changes set
    expect(unit.state).toEqual(changedState);

    unit.reset();

    // verify changes reset
    expect(unit.state).toEqual(initialState);
  });

  test.skip('reset => inputs state', () => {});
});

describe('registerForm', () => {
  test('registerForm => submit values are nested', () => {
    const rootForm = createUnit({ name: 'landing', inputs: { notes: {} } });
    const loginForm = createUnit({ name: 'login', inputs: { username: {}, password: {} } });
    const addressForm = createUnit({ name: 'address', inputs: { address: {} } });

    rootForm.registerForm(loginForm);
    rootForm.registerForm(addressForm);

    const submitValues = rootForm.submit();

    expect(submitValues).toEqual({
      login: { username: '', password: '' },
      address: { address: '' },
      notes: '',
    });
  });
});

// @flow

// NoteReview(simon): coupling concerns?
import { createInput } from './Input';

import type { InputConfig, InputNames, Input, InputValue } from './types';

//
// Helpers
//

// function nonNil<T>(val: ?T, defaultVal: T): T {
//   return val !== undefined && val !== null ? val : defaultVal;
// }

//
// Form implementation
//

type FormState = {|
  //
  // Form's inputs aggregated state
  //

  // all inputs are valid + form itself
  valid: boolean | typeof undefined,
  // any input is changing
  changing: boolean,
  // no single input hasn't been changed
  pristine: boolean,

  //
  // Form own state
  //

  // form submit states
  submit: 'idle' | 'pending' | 'failed' | 'done',
  // form client validation or submit error
  error: string,
|};

type IsEnum = 'valid' | 'pristine' | 'validating';

type InitialValues = { [InputNames]: InputValue };

export type AptConfig = {|
  initiallyValid: boolean | typeof undefined,
|};

type FormBaseProps = {|
  inputs: { [string]: InputConfig },
  initialValues?: InitialValues,
|};

type InternalProps = {|
  ...FormBaseProps,
|};

type DeclaredInputs = { [InputNames]: InputConfig };

// const warnOnDev = (msg) => {
//   if (process.env.NODE_ENV !== 'production') {
//     console.warn(msg);
//   }
// };

export type FormProps = {|
  ...FormBaseProps,
|};

class Form {
  props: InternalProps;
  config: AptConfig;
  state: FormState;
  inputInstances: { [InputNames]: Input };

  constructor(props: FormProps, config: AptConfig) {
    this.state = {
      // own state
      valid: undefined,
      submit: 'idle',
      // submit or form-wide validation error
      error: '',
      // based on inputs
      pristine: true,
      // review: ....
      changing: false,
    };
    this.props = props;
    this.config = config;
    this.inputInstances = this._createInputInstances(props.inputs);
  }

  //
  // Public API
  //

  is(s: IsEnum): boolean {
    if (s === 'valid') {
      return this.state.valid === true;
    }
    if (s === 'pristine') {
      return this.state.pristine === true;
    }
    if (s === 'validating') {
      return this.state.valid === undefined;
    }
    // This tells flow we intend to cover all possible values of s.
    (s: empty); // eslint-disable-line no-unused-expressions
    return false;
  }

  //
  // For tests only
  //

  // NotePrototype(simon): ...
  dumpState() {
    return { ...this.state };
  }

  //
  // Private helpers
  //

  // NotePrototype(simon): promise?
  _updateState(state: $Shape<FormState>) {
    this.state = {
      ...this.state,
      ...state,
    };
  }

  _createInputInstances(inputs: DeclaredInputs): { [InputNames]: Input } {
    const { config } = this;
    let result = {};
    for (const inputName of Object.keys(inputs)) {
      const inputConfig = inputs[inputName];
      const inputProps = { ...inputConfig, name: inputName };
      result[inputName] = createInput(inputProps, config);
    }
    return result;
  }
}

export function createForm(props: FormProps, config: AptConfig): Form {
  return new Form(props, config);
}

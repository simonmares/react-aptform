// @flow

// NoteReview(simon): coupling concerns?
import { createInput } from './Input';
import { isButton } from './utils';

import type { InputConfig, InputNames, Input, InputValue, EventType } from './types';

//
// Helpers
//

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
  config?: AptConfig,
  initialValues?: InitialValues,
|};

type InternalProps = {|
  ...FormBaseProps,
|};

// Naming types
// type NotifyState = {};
type DeclaredInputs = { [InputNames]: InputConfig };
type UnsubscribeFunction = () => void;
// type ListenerFunction = (NotifyState) => void;
type ListenerFunction = () => void;

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
  state: FormState;
  inputInstances: { [InputNames]: Input };
  listeners: Array<ListenerFunction>;

  isSetup: boolean;
  cleanupFn: () => void;

  constructor(props: FormProps) {
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
    this.listeners = [];
    this.props = props;
    this.inputInstances = this._createInputInstances(props.inputs);
  }

  //
  // Public API
  //

  // event handlers

  onSubmit(e: Event) {
    // Do not submit the form
    e.preventDefault();

    this.submit();
  }

  onBlur(e: EventType) {
    const target = e.target;
    if (isButton(target)) {
      return;
    }

    // const inputName = target.name;
    // this.onBlurInput(inputName);
  }

  onBlurInput(inputName: InputNames) {
    const changes = {
      focused: false,
      changing: false,
      touched: true,
    };

    // this.setInputState(inputName, changes);
    // if (this.shouldValidate('onBlur')) {
    //   this.runInputValidation(inputName);
    // }
  }

  onFocus(e: EventType) {
    const target = e.target;
    if (isButton(target)) {
      return;
    }

    // // We have to update `focused` only once so it makes sense to ask if its necessary
    // const inputName = target.name;
    // this.onFocusInput(inputName);
  }

  // Query API...

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

  // Imperative API...
  submit() {
    console.log('Form submitted');
  }

  subscribe(fn: ListenerFunction): UnsubscribeFunction {
    this.listeners.push(fn);
    // <= unsubscribe
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  setup() {
    if (this.isSetup) {
      return this.cleanupFn;
    }

    let unsubFunctions = [];
    for (const key of Object.keys(this.inputInstances)) {
      const input = this.inputInstances[key];
      unsubFunctions.push(
        input.subscribe(() => {
          this._onInputChange(input);
        })
      );
    }

    const cleanupFn = () => {
      const hasListeners = this.listeners.length > 0;
      if (hasListeners) {
        return;
      }
      unsubFunctions.forEach((fn) => fn());
    };

    this.cleanupFn = cleanupFn;
    return cleanupFn;
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
    // NoteReview(simon): pass an actual state?
    this._notifyListeners();
  }

  _onInputChange(inst: Input) {
    // NotePrototype(simon): dump input states?
    this._updateState({});
  }

  _notifyListeners() {
    this.listeners.forEach((fn) => fn());
  }

  _createInputInstances(inputs: DeclaredInputs): { [InputNames]: Input } {
    const { config } = this.props;
    let result = {};
    for (const inputName of Object.keys(inputs)) {
      const inputConfig = inputs[inputName];
      const inputProps = { ...inputConfig, name: inputName };
      result[inputName] = createInput(inputProps, config);
    }
    return result;
  }
}

export function createForm(props: FormProps): Form {
  return new Form(props);
}

export type { Form };

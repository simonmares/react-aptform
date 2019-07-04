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
type SetEnum = 'submit';

type InitialValues = { [InputNames]: InputValue };
type SubmitValues = Object;

export type AptConfig = {|
  initiallyValid: boolean | typeof undefined,
|};

type FormBaseProps = {|
  name: string,
  inputs: { [string]: InputConfig },
  config?: AptConfig,
  initialValues?: InitialValues,
  // NoteTypeLater: Object
  onSubmit?: (SubmitValues) => Promise<boolean>,
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
  subforms: Array<Form>;

  isSetup: boolean;
  cleanupFn: () => void;

  constructor(props: FormProps) {
    this.state = this._getInitialState();
    this.listeners = [];
    this.subforms = [];
    this.props = props;
    this.inputInstances = this._createInputInstances(props.inputs);
  }

  //
  // Public API
  //

  // event handlers

  onSubmit(e: Event): void {
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
      return this.state.valid === true && this._iterInputs().some((_) => !_.is('valid'));
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
  submit(): SubmitValues {
    this._updateState({ submit: 'pending' });

    let values = this._dumpSubmitValues();

    for (const subform of this.subforms) {
      values[subform.props.name] = subform._dumpSubmitValues();
    }

    const { onSubmit } = this.props;
    if (onSubmit) {
      onSubmit(values).then((result: boolean) => {
        this._updateState({ submit: result ? 'done' : 'failed' });
      });
    }

    return values;
  }

  reset() {
    // console.log('reset!');
    // const { inputs } = this.props;
    this.state = this._getInitialState();
  }

  subscribe(fn: ListenerFunction): UnsubscribeFunction {
    this.listeners.push(fn);
    // <= unsubscribe
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
  }

  // set(k: SetEnum, opts: any): void {
  //   // if (k === 'submit') {
  //   //   this._updateState({ submit: opts });
  //   //   return;
  //   // }
  //   // This tells flow we intend to cover all possible values of k.
  //   (k: empty); // eslint-disable-line no-unused-expressions
  // }

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

  registerForm = (f: Form) => {
    this.subforms.push(f);
    return () => {
      this.subforms = this.subforms.filter((_) => _ === f);
    };
  };

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

  _dumpSubmitValues() {
    let res = {};
    for (const input of this._iterInputs()) {
      res[input.props.name] = input.state.value;
    }
    return res;
  }

  _iterInputs(): Input[] {
    return Object.keys(this.inputInstances).map((_) => this.inputInstances[_]);
  }

  _getInitialState() {
    return {
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
  }

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

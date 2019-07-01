// @flow

import type { AptConfig, InputConfig } from './types';

//
// Helpers
//

function nonNil<T>(val: ?T, defaultVal: T): T {
  return val !== undefined && val !== null ? val : defaultVal;
}

//
// Constants
//

const defaultValue = '';

//
// Input implementation
//

type InputValue = any;
// type EventHandler = (e: Event) => any;

type PassProps = {|
  name: string,
  value: InputValue,
  // NoteReview(simon): PassProps could be only react-extension?
  // onChange can be resolved in form
  // onChange: EventHandler,
  required: boolean,
|};

type InputState = {|
  value: InputValue,
  // input is currently valid or not (or its unknown)
  valid: boolean | typeof undefined,
  // input has been focused
  touch: boolean,
  // input has now focus
  focus: boolean,
  // input has changed from initial value (provided or our default)
  pristine: boolean,
  // user still types (from heuretics)
  changing: boolean,
  // just error text
  error: string,
|};

type IsEnum = 'valid' | 'pristine' | 'validating';
type ShowEnum = 'error' | 'success';
type SetEnum = 'value' | 'error';

export type InputProps = {|
  name: string,
  required?: boolean,
  initialState?: $Shape<InputState>,
  ...InputConfig,
|};

type InternalProps = {|
  name: string,
  required: boolean,
|};

class Input {
  props: InternalProps;
  config: AptConfig;
  state: InputState;

  constructor(props: InputProps, config: AptConfig) {
    const initialState = props.initialState || {};

    this.state = {
      value: nonNil(initialState.value, defaultValue),
      valid: nonNil(initialState.valid, config.initiallyValid),
      touch: nonNil(initialState.touch, false),
      focus: nonNil(initialState.focus, false),
      pristine: nonNil(initialState.pristine, true),
      changing: nonNil(initialState.changing, false),
      error: nonNil(initialState.error, ''),
    };
    this.props = this._resolveProps(props);
    this.config = config;
  }

  //
  // Public API
  //

  //
  show(s: ShowEnum): boolean {
    // NotePrototype(simon): implement type timeout
    if (s === 'error') {
      return this.state.valid === false;
    }
    if (s === 'success') {
      return this.state.valid === true;
    }
    // This tells flow we intend to cover all possible values of s.
    (s: empty); // eslint-disable-line no-unused-expressions
    return false;
  }

  // NoteReview(simon): maybe react API only?
  // onChange should be on form as well
  getPassProps = (): PassProps => {
    const {
      props: { name, required },
      state: { value },
    } = this;

    return {
      name: name,
      value: value,
      // onChange,
      required,
    };
  };

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

  set(k: SetEnum, opts: any): void {
    if (k === 'value') {
      this._updateState({ value: opts, pristine: false, valid: undefined, error: '' });
      return;
    }
    if (k === 'error') {
      this._updateState({ error: opts, pristine: false, valid: false });
      return;
    }
    // This tells flow we intend to cover all possible values of k.
    (k: empty); // eslint-disable-line no-unused-expressions
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

  _resolveProps(props: InputProps): InternalProps {
    return {
      name: props.name,
      required: nonNil(props.required, false),
    };
  }

  // NotePrototype(simon): promise?
  _updateState(state: $Shape<InputState>) {
    this.state = {
      ...this.state,
      ...state,
    };
  }
}

export function createInput(props: InputProps, config: AptConfig): Input {
  return new Input(props, config);
}

export type { Input };

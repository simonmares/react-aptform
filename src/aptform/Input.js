// @flow

import type { AptConfig, InputConfig, EventType } from './types';

import { resolveConfig } from './helpers';
import { nonNil } from './utils';

//
// Constants
//

const defaultValue = '';

//
// Input implementation
//

type InputValue = any;
type EventHandler = (e: EventType) => any;

type PassProps = {|
  name: string,
  value: InputValue,
  // NoteReview(simon): PassProps could be only react-extension?
  // onChange can be resolved in form
  onChange: EventHandler,
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
type ListenerFunction = () => void;
type UnsubscribeFunction = () => void;

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
  listeners: Array<ListenerFunction>;

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
    this.listeners = [];
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
      onChange: (e) => {
        const value = e.currentTarget.value;
        this.set('value', value);
      },
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

  subscribe(fn: ListenerFunction): UnsubscribeFunction {
    this.listeners.push(fn);
    // <= unsubscribe
    return () => {
      this.listeners = this.listeners.filter((f) => f !== fn);
    };
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
    // NoteReview(simon): pass an actual state?
    this._notifyListeners();
  }

  _notifyListeners() {
    for (const fn of this.listeners) {
      fn();
    }
  }
}

export function createInput(props: InputProps, config?: AptConfig): Input {
  return new Input(props, resolveConfig(config));
}

export type { Input };
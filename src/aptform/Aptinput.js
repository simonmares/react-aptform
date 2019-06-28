// @flow

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
// Aptinput implementation
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

type AptinputState = {|
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

export type AptConfig = {|
  initiallyValid: boolean | typeof undefined,
|};

export type AptinputProps = {|
  name: string,
  required?: boolean,
  initialState?: $Shape<AptinputState>,
|};

type InternalProps = {|
  name: string,
  required: boolean,
|};

class Aptinput {
  props: InternalProps;
  config: AptConfig;
  state: AptinputState;

  constructor(props: AptinputProps, config: AptConfig) {
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

  //
  // Private helpers
  //

  _resolveProps(props: AptinputProps): InternalProps {
    return {
      name: props.name,
      required: nonNil(props.required, false),
    };
  }
}

export function createInput(props: AptinputProps, config: AptConfig): Aptinput {
  return new Aptinput(props, config);
}

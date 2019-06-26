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

type AptinputProps = {|
  name: string,
  required?: boolean,
  initialState?: $Shape<AptinputState>,
|};

type InternalProps = {|
  name: string,
  required: boolean,
|};

export class Aptinput {
  props: InternalProps;
  state: AptinputState;

  constructor(props: AptinputProps) {
    const initialState = props.initialState || {};

    this.state = {
      value: nonNil(initialState.value, defaultValue),
      valid: initialState.valid,
      touch: nonNil(initialState.touch, false),
      focus: nonNil(initialState.focus, false),
      pristine: nonNil(initialState.pristine, true),
      changing: nonNil(initialState.changing, false),
      error: nonNil(initialState.error, ''),
    };
    this.props = this._resolveProps(props);
  }

  //
  // Public API
  //

  // error | success
  show() {}

  // error | changed
  has() {}

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

  // valid | pristine | validating
  is() {}

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

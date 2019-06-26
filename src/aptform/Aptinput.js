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

type AptinputState = {|
  value: any,
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

export class Aptinput {
  props: AptinputProps;
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
  }

  //
  // Public API
  //

  // error | success
  show() {}

  // error | changed
  has() {}

  getPassProps() {}

  // valid | pristine | validating
  is() {}

  //
  // Private helpers
  //
}

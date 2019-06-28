// @flow

//
// Helpers
//

function nonNil<T>(val: ?T, defaultVal: T): T {
  return val !== undefined && val !== null ? val : defaultVal;
}

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

export type AptConfig = {|
  initiallyValid: boolean | typeof undefined,
|};

export type FormProps = {||};

type InternalProps = {||};

class Form {
  props: InternalProps;
  config: AptConfig;
  state: FormState;

  constructor(props: FormProps, config: AptConfig) {
    this.state = {
      valid: undefined,
      changing: false,

      pristine: true,
      submit: 'idle',
      error: '',
    };
    this.props = props;
    this.config = config;
  }

  //
  // Public API
  //

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
}

export function createForm(props: FormProps, config: AptConfig): Form {
  return new Form(props, config);
}

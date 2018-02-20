// @flow

type EventHandler = (e: Event) => mixed;

// undefined iff not validated current this.value yet
type ValidationState = ?boolean;

export type ValidationErrs = { [string]: boolean };

export type InputValue = string | number | boolean;
export type FormConfig = {|
  typeTimeout?: number,
  failFast?: boolean,
  msgInvalid?: string,
|};

export type PassProps = {
  name: string,
  value: InputValue,
  onChange: EventHandler,
  required: boolean,
};

export type InputState<TInputNames> = {
  name: TInputNames,
  onChange: EventHandler,
  value: InputValue,
  required: boolean,

  // if input config has provided 'validations', all must have pass for the current value
  valid: ValidationState,
  // input has been focused
  touched: boolean,
  // input is now focused
  focused: boolean,
  // input has changed (no matter it had initial or not)
  pristine: boolean,

  //
  // NOTE_REVIEW: just ideas
  //

  // whether pristine=false, changing=false
  changing: boolean,
  errorText: string,

  // helpers on prototype
  showError: () => boolean,
  showSuccess: () => boolean,
  hasError: () => boolean,

  // NOTE_REVIEW: additional usefullness vs duplicate API
  isValid: () => boolean,
  hasValidated: () => boolean,
  hasServerError: () => boolean,

  _serverErrors?: ValidationErrs,
  // map existing validators (NOTE_REVIEW: add generics)
  clientErrors: ValidationErrs,

  //
  // NOTE_PROTOTYPE:
  //
  // returns true iff had initial value and current value differs from the inital value
  hasChanged: () => boolean,
  getPassProps: () => PassProps,
};

export type FormState = {|
  isValid(): boolean,
  hasChanged(): boolean,
  // whole form is valid
  // valid: ValidationState,
  //
  // same as in input but for all inputs in the form:
  //
  // isTouched(): boolean,
  // isPristine(): boolean,
|};

// @flow

import type { Node } from 'react';

type EventHandler = (e: Event) => any;

// undefined iff not validated current this.value yet
type ValidationState = ?boolean;

export type ValidationErrs = { [string]: boolean };
export type ValidationPolicyNames = 'onMount' | 'onDelay' | 'onBlur' | 'onSubmit' | 'onCreate';

export type TInputNames = string;
export type InputValue = any;
export type EventType = SyntheticInputEvent<HTMLInputElement>;
export type FormConfig = {|
  typeTimeout?: number,
  asyncTimeout?: number,
  failFast?: boolean,
  resetOnSubmit?: boolean,
  initialValid?: boolean,
  // messages
  msgInvalid?: string,
  msgFormInvalid?: string,
  msgUnknownError?: string,
  // NotePrototype(simon): use this in code
  msgRequired?: string,

  // custom
  joinChar?: string,

  // NoteReview(simon): I think its better to enforce explicitly passing whole object,
  // instead of partials... lets see usage
  validationPolicy?: { [ValidationPolicyNames]: boolean },
|};

export type PassProps = {
  name: string,
  value: InputValue,
  onChange: EventHandler,
  required: boolean,
};

export type InputState = {
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

  asyncValidating: boolean,

  //
  // NOTE_REVIEW: just ideas
  //

  // whether pristine=false, changing=false
  changing: boolean,
  errorText: string,

  // helpers on prototype
  showError: () => boolean,
  showSuccess: () => boolean,

  // NOTE_REVIEW: additional usefullness vs duplicate API
  hasError: () => boolean,
  isValid: () => boolean,
  isValidating: () => boolean,

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
  isSubmitting(): boolean,
  hasChanged(): boolean,
  // whole form is valid
  // valid: ValidationState,
  //
  // same as in input but for all inputs in the form:
  //
  // isTouched(): boolean,
  // isPristine(): boolean,
|};

// type TInputNames = string;

export type AsyncValidator = (value: any) => Promise<{ asyncError: string | boolean }>;

export type InputConfig = {|
  validations?: { [key: TInputNames]: (value: any) => boolean },
  validateAsync?: AsyncValidator,
  validationOrder?: Array<TInputNames>,
  required?: boolean,
  getErrorText?: (input: InputState) => ?string,
  errorTextMap?: { [string]: string | ((i: InputState) => string) },
|};

type AnyInputValue = any;

type InputMap<TKeys, TValues> = { [TKeys]: TValues };
type FormValuesMap<TKeys> = InputMap<TKeys, AnyInputValue>;
export type InitialValues<TKeys> = InputMap<TKeys, AnyInputValue>;

type FormPassProps = {|
  onFocus: EventHandler,
  onBlur: EventHandler,
  onSubmit: Function,
|};

type RenderProps = {|
  inputs: InputMap<TInputNames, InputState>,
  form: {|
    ...FormState,
    ...FormPassProps,
    changeInput: (name: string, value: InputValue) => void,
    blurInput: (name: string) => void,
    focusInput: (name: string) => void,
    getPassProps: () => FormPassProps,

    submitting: boolean,
    submitFailed: boolean,
    submitSucceeded: boolean,
    submitErrorText: string,
  |},
|};

export type LocalState = {|
  inputStates: { [TInputNames]: InputState },
  submitting: boolean,
  submitFailed: boolean,
  submitSucceeded: boolean,
  submitErrorText: string,
|};

export type LocalProps = {
  // config override prop object?
  config?: FormConfig,

  inputs: { [TInputNames]: InputConfig | null },
  initialValues?: FormValuesMap<TInputNames>,

  // can return anything
  render: (props: RenderProps) => Node,

  formValidations?: {
    [inputName: string]: {
      [errorCode: string]: (formValues: FormValuesMap<TInputNames>) => boolean,
    },
  },

  // NOTE_REVIEW: type of promise
  // onSubmit is optional as there might be other props to handle submitting later
  onSubmit?: (values: FormValuesMap<TInputNames>) => ?Promise<$FlowFixMe>,
  errorTextMap?: { [string]: string },

  // NOTE_REVIEW: usefulness?, what args?
  onChange?: (name: string, value: any) => any,
  // unhandled error callback
  onError?: (error: Error, context?: string) => any,
};

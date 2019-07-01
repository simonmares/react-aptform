// @flow

import type { Input } from './Input';

// NotePrototype(simon): used only to mark where generics should be applied later
export type InputNames = string;
export type InputValue = any;

export type InputInstance = {
  name: InputNames,
  value: InputValue,
  required: boolean,
};

export type InputConfig = {|
  validations?: { [key: InputNames]: (value: InputValue, inst: InputInstance) => boolean },
  validationOrder?: Array<InputNames>,
  required?: boolean,
  // NoteReview(simon):
  // getErrorText?: (input: InputInstance) => ?string,
  errorTextMap?: { [string]: string | ((value: InputValue, i: InputInstance) => string) },
|};

// declaredValidationErrors: {
//   invalid: i18n.t`This is invalid`
// },
// validationErrors: {}

// declaredSubmitErrors: {
//   nonUnique: i18n.t`Not unique value`
// }
// submitErrors: {}

// NoteReview(simon): form/input scoped?
export type AptConfig = {|
  initiallyValid: boolean | typeof undefined,
|};

export type { Input };

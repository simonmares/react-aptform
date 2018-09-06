# Guides for using `react-aptform`

## Submit cases

Note: Resolve object/value is referencing to value resolved in promise returned in function provided as the `onSubmit` prop.

### reset to initial values on failed submit

_This is not possible (yet)._

### set submit failed with known error including an error message from server

_This is not possible (yet)._

### reset to initial values on successful submit

Provide `resetOnSubmit: true` in `config` prop of `AptForm` component, it will clear the form and fill it with what you provided in `initialValues` prop (values default to an empty string).

Then resolve with no value (`undefined`) or an empty object.

_This is default behavior._

### reset to updated values on successful submit

Resolve an object with `data` key, e.g. `{ data: { username: 'MyNewUsername' } }`. It will clear the form and set only provided fields.

### set submitting state

All you need to do is to return a promise in `onSubmit` prop. If the function returns Promise, submitting state is activated. When the promise settles, the submitting state is deactivated.

You can tell if a form is submitting by calling `form.isSubmitting()`.

### set submit failed

#### with known non-field error

Resolve an object with `submitError` key, e.g. `{ submitError: 'tooManyRequests' }`. Value is an error code.

To provide user text message, please write an error text for the error code (`tooManyRequests`) in top-level `errorTextMap` prop, e.g. `{ errorTextMap: { tooManyRequests: 'Too many requests. Try again, later.' } }`.

#### with unknown non-field error

If you don't know what happened, you can resolve with `{ submitError: true }`.

If you resolve with an error code like `{ submitError: '???' }`, that isn't provided in top-level `errorTextMap` prop, the result is same as with `true` value.

Both cases leads to `form.submitErrorText` to be `config.msgUnknownError` which defaults to "Unknown error ocurred.".

#### with known field error

For field-level submit errors, resolve an object with `errors` key that maps field name to error code e.g. `{ errors: { email: 'alreadyExists' } }` maps field `email` to error code `alreadyExists`.

#### with unknown field error

_This is not supported directly._

However if you resolve e.g. `{ errors: { email: '???' } }` and it doesn't map to input config's `errorTextMap` the `inputs.email.errorText` will be `config.msgInvalid` which defaults to "This input is invalid.".

#### with known multiple field errors

_This is not possible._

Multiple field errors usually happens when you omit client-side validation. You need to map multiple errors from server to e.g. first one.

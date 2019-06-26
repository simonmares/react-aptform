// @flow

/* eslint-disable no-unused-vars */

describe('form submitting states', () => {
  test('form API', () => {
    // submitting...

    // const form = new Aptform();

    const form: any = {};

    form.is('valid');
    // NoteReview(simon): document high-level input/form states and how
    // they can be queried against our API
    let hasChanged = !form.is('pristine');

    form.is('submitting');

    form.is('failed');
    // form.submitIs('failed')

    form.is('submitted');
    // form.submitIs('done')

    form.getErrorText('submit');
    form.getErrorText('form');
  });

  test('aptform "render prop"', () => {
    // what API should be available on each re-render (useAptform)
    const aptform = { inputs: {}, form: {} };
  });

  test('DONE: form event API', () => {
    const form: any = {};
    form.onSubmit();
    form.onFocus();
    form.onBlur();

    // I like the API its methods (bound) that I can simply pass on.
    // Also `form.getPassProps()` returns object with respective keys, so we must have
    // same props on form itself.
  });

  test('input event API', () => {
    const input: any = {};
    input.onChange();

    // react has decides "onChange" belongs to input, not form
    // If we write vanilla js implementation we could add the handler
    // to form and only in react API, we would add a proxy on the input.
  });

  test('form/input imperative API', () => {
    const aptform = { form: {}, inputs: { email: {} } };
    const { form } = aptform;

    // currently:
    form.changeInput('email', { value: 'a@example.com' });
    form.blurInput('email');
    form.focusInput('email');

    // alter (move to input):
    const { email } = aptform.inputs;
    email.change({ value: 'a@example.com' });
    email.blur();
    email.focus();

    // or just:
    // (must be clever as reducer) or add dispatch like API?

    // can set anything (must be strictly typed with public types)
    // e.g. blur, pristine, focus, value, ...
    email.setState({ value: 'a@example.com' });
    email.setState({ blur: true });
    email.setState({ focus: true });

    // I like setInputState more because beside changing input value every imperative API is
    // an edge case.
  });

  test('form API', () => {
    const form: any = {};

    form.is('valid');
    const hasChanged = !form.is('pristine');

    const isSubmitting = form.is('submitting');

    const submitFailed = form.is('failed');
    // form.submitIs('failed')

    const submitSucceeded = form.is('submitted');
    // form.submitIs('done')

    // string (either whole form client validation or server error)
    // e.g. repeat password or any invalid combination of many inputs
    const { errorText } = form;

    form.setState({ errorText: 'Server error message.' });
  });

  test('server errors', () => {
    // this is result from API
    const serverErrors = { email: { nonunique: 'This email is already used.' } };
    const aptform: any = {};
    const { email } = aptform.inputs;
    // pseudo-dynamic code e.g.
    if (serverErrors.email) {
      const allErrors = Object.values(serverErrors);
      const error = allErrors.join(', ');
      email.setState({ error });
    }

    // Note: there is typically 1 error from server for a field for given field
    // the error is also typically already translated so we can show it as is.

    // Maybe there could be API that can be used on client as well:
    const { form } = aptform;
    form.setErrors({
      email: 'This email is already used.',
      username: 'This username is not unique.',
    });
  });
});

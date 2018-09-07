// @flow

import * as React from 'react';

// project
import { Aptform } from '../src/index';

// examples
import { yesNo, DebugStateInput } from './helper-ui';
import { isEmailNaive as isEmail } from './helper-validators';

export const AsyncValidationExample = ({ action }: *) => {
  const alreadyExists = value => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(value !== 'rendon@example.com');
      }, 700);
    });
  };

  return (
    <Aptform
      initialValues={{
        name: 'Eliana Rendón',
        email: 'rendon@example.com',
      }}
      onSubmit={values => {
        return new Promise(resolve => {
          setTimeout(() => {
            alreadyExists(values.email).then(unique => {
              resolve(unique ? null : { errors: { email: 'alreadyExists' } });
            });
          }, 750);
        });
      }}
      inputs={{
        name: { required: true },
        email: {
          required: true,
          validations: { isEmail },
          asyncValidations: { alreadyExists },
          getErrorText: i =>
            i._serverErrors && i._serverErrors.alreadyExists ? 'The email is used' : '',
        },
      }}
      render={({ inputs, form }) => {
        const { name, email } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
            <div>
              Name: <input type="text" {...name.getPassProps()} />
              {name.showError() && name.errorText}
            </div>
            <div>
              Email: <input type="text" {...email.getPassProps()} />
              {email.showError() && email.errorText}
              {email.isValidating() ? '...' : ''}
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            {form.isValid() ? '' : 'Please fill all fields'}
          </form>
        );
      }}
    />
  );
};

export const WithValidations = ({ action }: *) => {
  const example = (
    <Aptform
      config={{
        typeTimeout: 500,
        failFast: true,
      }}
      initialValues={{
        email: '',
        password: '',
        name: '',
      }}
      inputs={{
        email: {
          validations: { isEmail },
          required: true,
        },
        password: {
          required: true,
          validations: {
            minLength: value => value.length > 5,
          },
        },
        name: {
          required: true,
        },
      }}
      onSubmit={action('onSubmit')}
      render={({ inputs, form }) => {
        const { password, email, name } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <div>hasChanged(): {yesNo(form.hasChanged())}</div>
            <div>isValid(): {yesNo(form.isValid())}</div>

            <DebugStateInput type="text" inputState={password} {...password.getPassProps()} />
            <DebugStateInput type="text" inputState={email} {...email.getPassProps()} />
            <DebugStateInput type="text" inputState={name} {...name.getPassProps()} />

            <button onClick={form.onSubmit}>Submit</button>
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <article>{example}</article>
    </React.Fragment>
  );
};

export const SortedValidations = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        superNumber: -100,
      }}
      inputs={{
        superNumber: {
          validations: {
            isPositive: val => val > 0,
            isOver10: val => val > 10,
            endsWith05: val => String(val).endsWith('05'),
          },
          validationOrder: ['isPositive', 'isOver10', 'endsWith05'],
          errorTextMap: {
            isPositive: 'Must be positive number.',
            isOver10: 'Must be larger than 10.',
            endsWith05: 'Must end with 05.',
          },
          required: true,
        },
      }}
      render={({ inputs, form }) => {
        const { superNumber } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <DebugStateInput
              type="number"
              inputState={superNumber}
              {...superNumber.getPassProps()}
            />
            <button onClick={form.onSubmit} disabled={!form.isValid()}>
              Submit
            </button>
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <p>
        <strong>Sorted validations</strong> positive => larger than 10 => ends with 05
      </p>
      <article>{example}</article>
    </React.Fragment>
  );
};

export const WithInvalidInitial = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        emailInitial: 'not@valid',
      }}
      inputs={{
        emailInitial: { required: true, validations: { isEmail } },
      }}
      render={({ inputs, form }) => {
        const { emailInitial } = inputs;
        return (
          <form {...form.getPassProps()}>
            <DebugStateInput
              type="text"
              inputState={emailInitial}
              {...emailInitial.getPassProps()}
            />
            <button onClick={form.onSubmit}>Submit</button>
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <p>
        <strong>Email with initial but invalid value</strong> Should display error without any
        change.
      </p>
      <article>{example}</article>
    </React.Fragment>
  );
};

export const SyncValidationExample = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        email: 'rendon@example.com',
      }}
      inputs={{
        email: {
          required: true,
          validations: { throwTypeError: val => !!val.path.does.not.exist, isEmail },
          validationOrder: ['throwTypeError', 'isEmail'],
        },
      }}
      onSubmit={() => {
        return Promise.resolve();
      }}
      onError={action('onError')}
      render={({ inputs, form }) => {
        const { email } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Email: <input type="text" {...email.getPassProps()} />
              {email.showError() && email.errorText}
              {email.isValidating() ? '...' : ''}
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              Submit
            </button>
            {form.isValid() ? '' : 'Please fill/fix all fields'}
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <p>
        <strong>Sync validation throws</strong> Validation 'throwTypeError' throws. It does not stop
        subsequent validation 'isEmail' to run. Callback onError is called with details.
      </p>
      <article>
        <p className="help">Change value to invalid email to see email is still being validated.</p>
        {example}
      </article>
    </React.Fragment>
  );
};

export const FullFormValidationExample = ({ action }: *) => {
  const arePasswordsSame = values => {
    if (values.password === '' || values.passwordAgain === '') {
      return true;
    }
    if (values.password === values.passwordAgain) {
      return true;
    }
    return false;
  };

  const example = (
    <Aptform
      initialValues={{
        password: '',
        passwordAgain: '',
      }}
      inputs={{
        password: {
          required: true,
        },
        passwordAgain: {
          required: true,
          errorTextMap: {
            arePasswordsSame: 'Passwords must match',
          },
        },
      }}
      formValidations={{
        passwordAgain: { arePasswordsSame },
      }}
      onSubmit={action('onSubmit')}
      onError={action('onError')}
      render={({ inputs, form }) => {
        const { password, passwordAgain } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Password: <input type="text" {...password.getPassProps()} />
              {password.showError() && password.errorText}
            </div>
            <div>
              Password again: <input type="text" {...passwordAgain.getPassProps()} />
              {passwordAgain.showError() && passwordAgain.errorText}
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              Submit
            </button>
            {form.isValid() ? '' : 'Please fill/fix all fields'}
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <h1>Form wide validation</h1>
      <p>Passwords must be same.</p>
      <article>
        <p>Should display an error for the second field if both fields are filled but not same.</p>
        {example}
      </article>
    </React.Fragment>
  );
};

export const RequiredEmptyExample = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        password: '',
        username: 'Tom',
      }}
      inputs={{
        password: {
          required: true,
        },
        username: {
          required: true,
        },
      }}
      render={({ inputs, form }) => {
        const { password, username } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Password: <input type="text" {...password.getPassProps()} /> *
              {password.showError() && password.errorText}
            </div>
            <div>
              Username: <input type="text" {...username.getPassProps()} /> *
              {username.showError() && username.errorText}
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              Submit
            </button>
            {form.isValid() ? '' : 'Form is not valid.'}
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <p>
        <strong>Required field initially empty</strong> Form is invalid if any of required fields
        are not filled.
      </p>
      <article>
        <p>Should display disabled submit button as the form is not valid.</p>
        {example}
      </article>
    </React.Fragment>
  );
};

export default {
  'Async validation': AsyncValidationExample,
  'With validations': WithValidations,
  'Invalid initial': WithInvalidInitial,
  'Sorted validations': SortedValidations,
  'Sync validation': SyncValidationExample,
  'Form-wide validation': FullFormValidationExample,
  'Required empty': RequiredEmptyExample,
};

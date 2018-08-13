// @flow

import * as React from 'react';

// project
import { Aptform } from '../src/index';

// examples
import { yesNo, TestCase, DebugStateInput } from './helper-ui';
import { isEmailNaive as isEmail } from './helper-validators';
import * as exampleUI from './helper-ui';

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
          validations: { isEmail, alreadyExists },
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

export const WithValidations = ({ action }: *) => (
  <div>
    <Aptform
      config={{
        typeTimeout: 500,
        failFast: true,
      }}
      initialValues={{
        emailInitial: 'not@valid',
        email: '',
        superNumber: -100,
        password: '',
        name: '',
      }}
      inputs={{
        emailInitial: { required: true, validations: { isEmail } },
        email: {
          validations: { isEmail },
          required: true,
        },
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
        const { password, email, name, emailInitial, superNumber } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus}>
            <div>hasChanged(): {yesNo(form.hasChanged())}</div>
            <div>isValid(): {yesNo(form.isValid())}</div>

            <DebugStateInput type="text" inputState={password} {...password.getPassProps()} />
            <DebugStateInput type="text" inputState={email} {...email.getPassProps()} />
            <DebugStateInput type="text" inputState={name} {...name.getPassProps()} />
            <TestCase
              title="Email with initial but invalid value"
              desc="Should display error without any change."
            >
              <DebugStateInput
                type="text"
                inputState={emailInitial}
                {...emailInitial.getPassProps()}
              />
            </TestCase>
            <TestCase title="Sorted validations" desc="positive => larger than 10 => ends with 05">
              <DebugStateInput
                type="number"
                inputState={superNumber}
                {...superNumber.getPassProps()}
              />
            </TestCase>
            <button onClick={form.onSubmit}>Submit</button>
          </form>
        );
      }}
    />
  </div>
);

export const SyncValidationExample = ({ action }: *) => {
  return (
    <div>
      <exampleUI.ExampleVariantInfo
        title="Sync validation throws"
        desc={`
          Validation 'throwTypeError' throws.
          It does not stop subsequent validation 'isEmail' to run.
          Callback onError is called with details.`}
      />

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
      <exampleUI.ExampleVariantDeliminer />
    </div>
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

  return (
    <div>
      <exampleUI.ExampleInfo
        title="Form wide validation"
        desc={`
          Passwords must be same.
        `}
      />
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
    </div>
  );
};

export const RequiredEmptyExample = ({ action }: *) => {
  return (
    <div>
      <exampleUI.ExampleInfo
        title="Required fields not filled initially"
        desc={`
          Form is invalid if required fields (both) are not filled.
        `}
      />
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
          },
        }}
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
              {form.isValid() ? '' : 'Form is not valid.'}
            </form>
          );
        }}
      />
    </div>
  );
};

export default {
  'Async validation': AsyncValidationExample,
  'With validations': WithValidations,
  'Sync validation': SyncValidationExample,
  'Form-wide validation': FullFormValidationExample,
  'Required empty': RequiredEmptyExample,
};

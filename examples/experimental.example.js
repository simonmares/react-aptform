// @flow

import * as React from 'react';

// project
import { Aptform } from '../src/index';

// examples
import { isEmailNaive as isEmail } from './helper-validators';

export const AsyncValidationExample = ({ action }: *) => {
  const alreadyExists = value => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(value !== 'rendon@example.com');
      }, 700);
    });
  };

  const validateAsync = value => {
    return alreadyExists(value).then(isOk => {
      return { asyncError: isOk ? false : 'alreadyExists' };
    });
  };

  return (
    <Aptform
      initialValues={{
        name: 'Eliana Rendón',
        email: 'rendon@example.com',
      }}
      inputs={{
        name: { required: true },
        email: {
          required: true,
          validations: { isEmail },
          validateAsync,
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

export default {
  'Async validation': AsyncValidationExample,
};

// @flow

import * as React from 'react';

// project
import { Aptform } from '../src/index';

// examples

import { DebugStateInput } from './helper-ui';

const isEmailNaive = (value: string) => !!value.match(/\w+@\w+\.[A-Z]+/i);
const isEmail = isEmailNaive;

export const GradualError = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        email: 'rendon@example.com',
      }}
      inputs={{
        email: {
          required: true,
          validations: { isEmail },
        },
      }}
      render={({ inputs, form }) => {
        const { email } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              <div style={{ color: email.hasError() ? 'crimson' : '' }}>
                Email:
                <input
                  type="text"
                  {...email.getPassProps()}
                  style={{ outline: email.hasError() ? '1px solid crimson' : '' }}
                />
                {email.isValidating() ? '...' : ''}
                {email.showError() && email.errorText}
              </div>
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            {form.isValid() ? '' : 'Please fill all fields'}

            <hr />
            <DebugStateInput
              type="text"
              name={email.name}
              value={email.value}
              onChange={email.onChange}
              inputState={email}
            />
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <article>
        <p>Shows input is invalid immediately (red), but error message later.</p>
        {example}
      </article>
    </React.Fragment>
  );
};

export default {
  'gradual error': GradualError,
};

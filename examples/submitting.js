// @flow

import * as React from 'react';

// project
import { Aptform } from '../src/index';

// examples
import * as exampleUI from './helper-ui';
// import { isEmailNaive } from './helper-validators';

export const SubmittingWithErrorsExample = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        name: 'Eliana Rendón',
      }}
      onSubmit={values => {
        action('onSubmit')('Submitting values: ', values);
        return new Promise(resolve => {
          setTimeout(() => {
            if (values.name === 'Eliana Rendón') {
              resolve({ errors: { name: 'alreadyExists' } });
            } else {
              resolve();
            }
          }, 750);
        });
      }}
      inputs={{
        name: {
          required: true,
          errorTextMap: {
            alreadyExists: 'user already taken',
          },
        },
      }}
      render={({ inputs, form }) => {
        const { name } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Name: <input type="text" {...name.getPassProps()} />
              {name.showError() ? <span>Error: {name.errorText}</span> : null}
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

  return (
    <React.Fragment>
      <h1>Field error after submit</h1>
      <article>
        <p>Click the submit button, user Eliana Rendón already exists.</p>
        {example}
      </article>
    </React.Fragment>
  );
};

export const SubmittingNonFieldErrorExample = ({ action }: *) => {
  const example = (
    <Aptform
      initialValues={{
        username: 'eliana',
      }}
      onSubmit={values => {
        return new Promise(resolve => {
          setTimeout(() => {
            if (values.username === 'eliana') {
              resolve({ submitError: 'tooManyReqError' });
            } else {
              resolve();
            }
          }, 750);
        });
      }}
      inputs={{
        username: {
          required: true,
        },
      }}
      errorTextMap={{
        tooManyReqError: 'too many requests, try again',
      }}
      render={({ inputs, form }) => {
        const { username } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              username: <input type="text" {...username.getPassProps()} />
              {username.showError() ? <span>Error: {username.errorText}</span> : null}
            </div>
            <button type="submit" disabled={!form.isValid() || form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            {form.submitFailed ? form.submitErrorText : ''}
            {form.isValid() ? '' : 'Please fill all fields'}
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <h1>Non field error after submit</h1>
      <article>
        <p>Just click the button without changing the value.</p>

        {example}
      </article>
    </React.Fragment>
  );
};

export const SubmittingExample = ({ action }: *) => {
  const initialValues = {
    name: 'Eliana Rendón',
  };
  const inputs = {
    name: { required: true },
  };
  const onSubmit = values => {
    action('onSubmit')('Submitting values: ', values);
    return new Promise(resolve => {
      setTimeout(resolve, 700);
    });
  };
  const commonProps = { initialValues, inputs, onSubmit };

  const example = (
    <Aptform
      {...commonProps}
      render={({ inputs, form }) => {
        return (
          <form {...form.getPassProps()}>
            <div>
              Name: <input type="text" {...inputs.name.getPassProps()} />
            </div>
            <button type="submit" disabled={form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
          </form>
        );
      }}
    />
  );

  const exampleNotReset = (
    <Aptform
      {...commonProps}
      config={{
        resetOnSubmit: false,
      }}
      render={({ inputs, form }) => {
        return (
          <form {...form.getPassProps()}>
            <div>
              Name: <input type="text" {...inputs.name.getPassProps()} />
            </div>
            <button type="submit" disabled={form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <h1>Submitting</h1>
      <article>
        <section>
          <p>
            After clicking on submit, it should display Submitting... text on the submit button and
            disable the button.
          </p>
          {example}
        </section>
        <section>
          <p>After submit is done, the submitted value should be kept. By default, its resetted.</p>
          {exampleNotReset}
        </section>
      </article>
    </React.Fragment>
  );
};

export const SubmittingRejectedExample = ({ action }: *) => {
  const commonProps = {
    initialValues: {
      name: 'Eliana Rendón',
    },
    inputs: {
      name: { required: true },
    },
    onSubmit: values => {
      action('onSubmit')('Submitting values: ', values);
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Something wrong happened ...somewhere ...sometime.'));
        }, 750);
      });
    },
    onError: action('onError'),
  };

  const example = (
    <Aptform
      {...commonProps}
      render={({ inputs, form }) => {
        const { name } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Name: <input type="text" {...name.getPassProps()} />
            </div>
            <button type="submit" disabled={form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
            {form.submitFailed ? form.submitErrorText : ''}
          </form>
        );
      }}
    />
  );

  const exampleInvalidField = (
    <Aptform
      {...commonProps}
      inputs={{
        ...commonProps.inputs,
        name: {
          ...commonProps.inputs.name,
          validations: { nameHasChanged: val => val !== commonProps.initialValues.name },
        },
      }}
      render={({ inputs, form }) => {
        const { name } = inputs;
        return (
          <form {...form.getPassProps()}>
            <div>
              Name: <input type="text" {...name.getPassProps()} />
            </div>
            <button type="submit" disabled={form.submitting}>
              {form.submitting ? 'Submitting...' : 'Submit'}
            </button>
            <div>{form.isValid() ? '' : 'Please fill all fields'}</div>
            <div>{form.submitFailed ? form.submitErrorText : ''}</div>
          </form>
        );
      }}
    />
  );

  return (
    <React.Fragment>
      <h1>Rejection (unknown errors)</h1>
      <article>
        <section>
          <h2>Submit rejection</h2>
          <p>Submit fails with rejection, submit error should be shown.</p>
          {example}
        </section>
        <section>
          <h2>Invalid field submit error</h2>
          <p>
            If form is submitted while having error, an error is shown. The field is invalid if its
            not changed from initial.
          </p>
          {exampleInvalidField}
        </section>
      </article>
    </React.Fragment>
  );
};

export default {
  'submitting state': SubmittingExample,
  'w/ field errors': SubmittingWithErrorsExample,
  'w/ nonfield error': SubmittingNonFieldErrorExample,
  'w/ form rejected': SubmittingRejectedExample,
};

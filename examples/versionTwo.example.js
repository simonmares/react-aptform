// @flow

import * as React from 'react';
import { useRef } from 'react';

import { useForm } from '../src/react-aptform';

import './form-semantic.css';

const staticProps = {
  inputs: {
    name: { required: true },
    surname: { required: true },
  },
};

function BasicExample() {
  const submitValues = useRef({});

  const onSubmit = (values) => {
    submitValues.current = values;
    console.log('values', values);
    form.reset();
    return Promise.resolve(true);
  };

  const { inputs, form, aptform } = useForm({ ...staticProps, onSubmit });
  const { name, surname } = inputs;

  const formInvalid = !form.is('valid');

  const renderForm = () => {
    return (
      <form {...form.getPassProps()}>
        <fieldset>
          <label htmlFor="name_id">Name</label>
          <input type="text" id="name_id" {...name.getPassProps()} />
        </fieldset>
        <fieldset>
          <label htmlFor="surname_id">Surname</label>
          <input type="text" id="surname_id" {...surname.getPassProps()} />
        </fieldset>
        <button type="submit" disable={formInvalid}>
          Submit
        </button>
      </form>
    );
  };

  return (
    <div>
      {renderForm()}
      <hr />
      submit values: {JSON.stringify(submitValues.current, null, 2)}
    </div>
  );
}
// <button type="submit" disabled={form.submitting}>
//   {form.submitting ? 'Submitting...' : 'Update'}
// </button>
// <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
// {form.submitFailed ? form.submitErrorText : ''}

function StyleExample() {
  return (
    <form>
      <fieldset>
        <label htmlFor="name_id">Name</label>
        <input type="text" id="name_id" value="..." />
      </fieldset>
      <fieldset>
        <label htmlFor="surname_id">Surname</label>
        <input type="text" id="surname_id" value="..." />
      </fieldset>

      <button type="submit">Submit</button>
    </form>
  );
}

export default {
  basic: () => <BasicExample />,
  style: () => <StyleExample />,
};

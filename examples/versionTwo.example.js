// @flow

import * as React from 'react';
import { useRef, useEffect } from 'react';

import { useForm } from '../src/react-aptform';

import './form-semantic.css';

function NestedExample() {
  function UserForm({ registerForm }) {
    console.log('User render');

    const { inputs, form, aptform } = useForm({
      name: 'user',
      inputs: {
        name: { required: true },
        surname: { required: true },
      },
    });

    useEffect(() => {
      return registerForm(aptform);
    }, [aptform]);

    const { name, surname } = inputs;

    return (
      <div {...form.getPassProps()}>
        {form.is('valid') ? 'OK' : ''}
        <fieldset>
          <label htmlFor="name_id">Name</label>
          <input type="text" id="name_id" {...name.getPassProps()} />
        </fieldset>
        <fieldset>
          <label htmlFor="surname_id">Surname</label>
          <input type="text" id="surname_id" {...surname.getPassProps()} />
        </fieldset>
      </div>
    );
  }

  function AddressForm({ registerForm }) {
    console.log('Address render');

    const { inputs, form, aptform } = useForm({
      name: 'address',
      inputs: { street: { required: true } },
    });

    useEffect(() => {
      return registerForm(aptform);
    }, [aptform]);

    const { street } = inputs;

    return (
      <div {...form.getPassProps()}>
        {form.is('valid') ? 'OK' : ''}
        <fieldset>
          <label htmlFor="street_id">Street</label>
          <input type="text" id="street_id" {...street.getPassProps()} />
        </fieldset>
      </div>
    );
  }

  function RootForm() {
    console.log('Root render');

    const submitValues = useRef({});

    const onSubmit = (values) => {
      submitValues.current = values;
      console.log('values', values);
      form.reset();
      return Promise.resolve(true);
    };

    const { form, aptform } = useForm({ name: 'landingform', onSubmit, inputs: {} });

    const renderForm = () => {
      return (
        <form {...form.getPassProps()}>
          <h2>User</h2>
          <UserForm registerForm={aptform.registerForm} />

          <h2>Address</h2>
          <AddressForm registerForm={aptform.registerForm} />

          <button type="submit">Submit</button>
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

  return <RootForm />;
}
// <button type="submit" disabled={form.submitting}>
//   {form.submitting ? 'Submitting...' : 'Update'}
// </button>
// <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
// {form.submitFailed ? form.submitErrorText : ''}

function GistExample() {
  const onSubmit = (values) => {
    console.log('values', values);
    return Promise.resolve(true);
  };
  const { inputs, form } = useForm({
    name: 'user',
    inputs: {
      name: { required: true },
      surname: { required: true },
    },
    onSubmit,
  });
  const { name, surname } = inputs;
  const formInvalid = !form.is('valid');
  return (
    <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
      <fieldset>
        <label htmlFor="name_id">Name</label>
        <input
          type="text"
          id="name_id"
          value={name.value}
          name={name.name}
          onChange={name.onChange}
        />
      </fieldset>
      <fieldset>
        <label htmlFor="surname_id">Surname</label>
        <input
          type="text"
          id="surname_id"
          value={surname.value}
          name={surname.name}
          onChange={surname.onChange}
        />
      </fieldset>
      <button type="submit" disable={String(formInvalid)}>
        Submit
      </button>
    </form>
  );
}

function BasicExample() {
  const submitValues = useRef({});

  const onSubmit = (values) => {
    submitValues.current = values;
    console.log('values', values);
    form.reset();
    return Promise.resolve(true);
  };

  const { inputs, form, aptform } = useForm({
    name: 'user',
    inputs: {
      name: { required: true },
      surname: { required: true },
    },
    onSubmit,
  });
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
        <button type="submit" disable={String(formInvalid)}>
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
  nested: () => <NestedExample />,
  style: () => <StyleExample />,
  gist: () => <GistExample />,
};

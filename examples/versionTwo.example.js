// @flow

import * as React from 'react';

import { useForm } from '../src/react-aptform';

const staticProps = {
  inputs: {
    name: { required: true },
    surname: { required: true },
  },
};

function BasicExample() {
  const { inputs, form, aptform } = useForm(staticProps);
  const { name, surname } = inputs;
  return (
    <form {...form.getPassProps()}>
      <div>
        Name: <input type="text" {...name.getPassProps()} />
      </div>
      <div>
        Surname: <input type="text" {...surname.getPassProps()} />
      </div>
    </form>
  );
}
// <button type="submit" disabled={form.submitting}>
//   {form.submitting ? 'Submitting...' : 'Update'}
// </button>
// <span>{form.isValid() ? '' : 'Please fill all fields'}</span>
// {form.submitFailed ? form.submitErrorText : ''}

export default {
  basic: () => <BasicExample />,
};

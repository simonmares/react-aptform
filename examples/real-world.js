// @flow

import * as React from 'react';

// material-ui
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';

// formik
import { Formik } from 'formik';

// project
import { Aptform } from '../src/index';

function MaterialUIBasic() {
  function TextFieldInput({ label, inputState }) {
    return (
      <TextField
        label={label}
        value={inputState.value}
        onChange={inputState.onChange}
        name={inputState.name}
        fullWidth
      />
    );
  }

  const example = (
    <Aptform
      initialValues={{
        name: 'Eliana Rendón',
        email: 'eliana@example.com',
      }}
      onSubmit={values => {
        console.log('Name value: ', values.name);
        console.log('Email value: ', values.email);
      }}
      inputs={{
        name: { required: true },
        email: { validations: { isEmail: val => /@/.test(val) } },
      }}
      render={({ inputs, form }) => {
        const { name, email } = inputs;
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
            <TextFieldInput label="Name" inputState={name} />
            <TextFieldInput label="E-mail" inputState={email} />
            <Button type="submit" variant="contained" color="primary" disabled={!form.isValid()}>
              Submit
            </Button>
          </form>
        );
      }}
    />
  );
  return <React.Fragment>{example}</React.Fragment>;
}

function MaterialUI30({ performant, action }: *) {
  class TextFieldInput extends React.Component<{ label: string, inputState: Object }, *> {
    shouldComponentUpdate(nextProps) {
      if (performant) {
        return this.props.inputState !== nextProps.inputState;
      }

      return true;
    }

    render() {
      const { inputState, label } = this.props;
      return (
        <TextField
          label={label}
          value={inputState.value}
          onChange={inputState.onChange}
          name={inputState.name}
          fullWidth
        />
      );
    }
  }

  const inputs = {};
  const initialValues = {};

  for (let i = 10; i < 40; i++) {
    const name = `field_${i}`;
    inputs[name] = { required: false };
    initialValues[name] = `name #${i}`;
  }

  const onSubmit = action('onSubmit');

  const example = (
    <Aptform
      inputs={inputs}
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({ inputs, form }) => {
        return (
          <form onBlur={form.onBlur} onFocus={form.onFocus} onSubmit={form.onSubmit}>
            <div style={{ columnCount: 2 }}>
              {Object.keys(inputs).map(key => {
                const input = inputs[key];
                return <TextFieldInput key={input.name} label={input.name} inputState={input} />;
              })}
            </div>
            <Button type="submit" variant="contained" color="primary" disabled={!form.isValid()}>
              Submit
            </Button>
          </form>
        );
      }}
    />
  );
  return <React.Fragment>{example}</React.Fragment>;
}

function MaterialUI30Formik({ action }: *) {
  const initialValues = {};

  for (let i = 10; i < 40; i++) {
    const name = `field_${i}`;
    initialValues[name] = `name #${i}`;
  }

  const onSubmit = action('onSubmit');

  const example = (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      render={({
        values,
        errors,
        touched,

        handleChange,
        handleBlur,
        handleSubmit,

        isValid,
        isSubmitting,
      }) => (
        <form onSubmit={handleSubmit}>
          <div style={{ columnCount: 2 }}>
            {Object.keys(initialValues).map(name => {
              return (
                <TextField
                  fullWidth
                  label={name}
                  key={name}
                  name={name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values[name]}
                />
              );
            })}
          </div>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={touched && (!isValid || isSubmitting)}
          >
            Submit
          </Button>
        </form>
      )}
    />
  );
  return example;
}

export default {
  'material UI basic': MaterialUIBasic,
  'material UI 30 inputs normal': MaterialUI30,
  'material UI 30 inputs performant': ({ action }: *) => (
    <MaterialUI30 performant action={action} />
  ),
  'material UI 30 inputs with Formik': MaterialUI30Formik,
};

## About

`react-aptform` is a library to work with forms in react efficiently. It aims for both DX and UX to make forms less tedious.

### Installation

```sh
npm install --save react-aptform
```

Or with yarn:
```sh
yarn add react-aptform
```

The package expects at least `react@16.0.0`.

### Project goals

- practicality first
- well performant for reasonably small forms (< 30 inputs)
- specify common form behaviour declaratively
- API that doesn't go in your way

### Features

**Functional**

- storing values of controlled inputs
- tracking input meta state (for custom UI e.g. to make UX better)
- consistent forms behaviour accross your app (`preconfigure`)
- validation framework (i18n friendly errors, suggestions on *showing* the validation error/success)

**Non functional**

- no need for custom class components for inputs or forms
- does not render anything on its own neither it listens to DOM events
- provides mature input meta state modeling
- no setup needed (main component works out-of-box)

#### Show validation insight

Our API includes method that shows validation error / success on custom rules in order to improve UX.

#### i18n friendly validation

Validation is boolean-based rather string-based, it makes i18n simpler and its less fragile.

#### No actual rendering

We provide behavioral components that only hook into React system, but leaves rendering up to a function you provide. This avoids e.g. styling problems. You have total control of how your inputs look.

### Use cases

- login and signup forms
- profile page
- any temporary forms (including custom input components)

For more complex use cases see below for **[Alternatives](#alternatives)**.

## Usage gist

What you gain in this example:

- you know whether a **form is valid**
- you know whether an **input is valid**
- you have a **place to store input states** to leverage controlled inputs (you can use the current value however you want in render)
- you will **receive all the values** in a single object (`onSubmit`)
- you can set **default value for each input** with a single object

What you need to do:

- you must set all the required handlers on `form` and `input` components (you can leverage `getPassProps`)
- you must provide a configuration for an input if its required or has validation

Notes:

- `value`, `name` and `onChange` input props can be passed automatically with JSX expression `{...email.getPassProps()}`
- you can set form handlers automatically too with `{...form.getPassProps()}`

```js
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
          <div>
            Name: <input type="text" value={name.value} name={name.name} onChange={name.onChange} />
          </div>
          <div>
            Email:
            <input type="email" value={email.value} name={email.name} onChange={email.onChange} />
          </div>
          <button type="submit" disabled={!form.isValid()}>
            Submit
          </button>
        </form>
      );
    }}
  />
```

## More documentation

- [**API.md:** documented components, their props and object shapes](docs/API.md)
- [**implementation.md:** documented implementation decisions](docs/implementation.md)

## Limitations

### React native

While it can be used with react native, the library doesn't aim for it. You can use
https://github.com/jaredpalmer/formik for more fluent usage.

### Nested fields

Library doesn't work with nested fields at all, you can try
https://github.com/jaredpalmer/formik or https://github.com/final-form/react-final-form for this use case.

## Alternatives

This library was inherently inspired by following react form solutions:

- https://github.com/jaredpalmer/formik (declarative configuration, input states)
- https://github.com/final-form/react-final-form (input states, use cases in examples)
- https://github.com/vacuumlabs/react-custom-validation (show validation recommendation)
- https://github.com/christianalfoni/formsy-react (convenience)
- https://github.com/erikras/redux-form (input states)

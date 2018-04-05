## About

`react-apt-form` is a set of components to practially deal with forms in react applications.

### Project goals

- "practicality beats purity"
- great performance for reasonable small forms (< 30 inputs)
- specify form behaviour declaratively
- small understandable API, no magic
- great both user and developer experience

### Features

**Functional**

- a place to store controlled input values
- validation utility
- storing multiple forms at one place
- tracking input meta state (you'll need that for better form UX)
- consistent forms behaviour (using `ConfigureForms` component)
- provides suggestions on *showing* the validation error/success

**Non functional**

- no need for custom components for inputs or forms
- does not render anything on its own neither it listens to DOM events
- provides mature input meta state modeling
- no setup needed (main component works out-of-box)

#### Show validation insight

Our API includes method that shows validation error / success on custom rules in order to improve UX.

#### i18n friendly validation

Validation is boolean-based rather string-based.

#### No actual rendering

We provide behavioral components that only hook into React system, but does not render anything. This avoids e.g. styling problems. You have total control of how your inputs look.

### Use cases

- login and signup forms
- profile page
- any temporary forms (including custom input components)

## Usage gist

Gains in this example:

- you know whether a form is valid
- you know whether an input is valid
- you have a place to store input states to leverage controlled inputs (you can use the current value however you want in render)
- you will receive all the values in a single object (`onSubmit`)
- you can set default value for each input with a single object

Constraints:

- you must set all the required handlers on `form` and `input` components (you can leverage `getPassProps`)

Notes:

- `value`, `name` and `onChange` input props can be passed automatically with JSX expression `{...email.getPassProps()}`
- you can set form handlers automatically too with `{...form.getPassProps()}`

```
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

- [**API.md** (documented components, their props and object shapes)](docs/API.md)
- **Implementation.md** (documented implementation decisions)

## Alternatives

This library was inherently inspired by following react form solutions:

- https://github.com/vacuumlabs/react-custom-validation (show validation recommendation)
- https://github.com/jaredpalmer/formik (declarative configuration, input states)
- https://github.com/christianalfoni/formsy-react (convenience)
- https://github.com/erikras/redux-form (input states)

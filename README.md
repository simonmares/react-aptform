## About

[![npm](https://badgen.net/npm/v/react-aptform)](https://www.npmjs.com/package/react-aptform)
[![gzip size](https://badgen.net/bundlephobia/minzip/react-aptform)](https://bundlephobia.com/result?p=react-aptform)
[![build status](https://badgen.net/travis/simonmares/react-aptform)](https://travis-ci.org/simonmares/react-aptform)

`react-aptform` is a library to work with forms in react efficiently without trade-offs. It aims for both <span title="developer experience">DX</span> and <span title="user experience">UX</span> to make forms simpler to develop and use.

### Installation

```sh
npm install --save react-aptform
```

Or with yarn:

```sh
yarn add react-aptform
```

The package expects you have at least `react@16.8.0` installed.

### Project goals

- performance
- easy to develop
- forms code easy to read and change

## Documentation

All documentation is in [docs](docs) directory of the repository.

Highlights:

- [**API**](docs/API.md) documented components, their props and object shapes
- [**guides**](docs/guides.md) how to use the package for different use cases
- [**implementation**](docs/implementation.md) implementation decisions rationale (to help you memorize the API?)

See it in action on [**deployed examples**](https://simonmares.github.io/react-aptform/) and also check the [**example sources**](examples).

Many edge cases are implemented in the [**test files**](tests).

## Features

**Functional**

- **declarative input configuration** allows consistent behavior of same inputs in different forms throughout your app
- **validation framework** with i18n friendly errors, suggestions on _showing_ the validation error/success
- **submit framework** reset data on success, set server errors, self-managing submitting state
- **show validation insight** API includes methods to show validation error / success based on custom configured rules in order to improve UX
- **i18n friendly validation** validation is boolean-based rather string-based, it makes i18n simpler and its less fragile

**Technical**

- **all form/input state included** provides mature input meta state modeling with easy to read API
- **no setup needed** works out-of-box with sensible defaults
- **flow typed**
- **no actual rendering** we provide an API that only hook into React system, but leaves rendering up to you. You have total control of how your inputs look

### Use cases

- login and register forms
- profile settings forms
- any temporary forms (including custom input components)

For more complex use cases see below for **[Alternatives](#alternatives)**.

## Usage example

What you get (in this example):

- you know whether a **form as a whole is valid**
- you know whether an **individual input is valid**
- you have a **place to store input states** to leverage controlled inputs (you can use the current value however you want in render)
- you will **receive all the values** in a single object (`onSubmit`)
- you can set **default value for each input** with a single object

What you need to do:

- you must set all the required handlers on `form` and `input` components
- you must provide a configuration for an input if its required (here both are) or has a validation

```js
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
```

You can find the example in [examples](examples).

Notes:

- `value`, `name` and `onChange` input props can be passed automatically with JSX expression `{...email.getPassProps()}`
- you can set form handlers automatically too with `{...form.getPassProps()}`

## Alternatives

### Limitations of `react-aptform`

- no Typescript support (use Formik)
- no React native support (use Formik)
- no nested fields (use Formik or `react-final-form`)

**Project constraints:**

- for browser only
- only one API (a single react hook)
- must be i18n-friendly

### Inspiration

This library was inherently inspired by following react form solutions:

- https://github.com/jamiebuilds/react-jeff (input states)
- https://github.com/jaredpalmer/formik (declarative configuration, input states)
- https://github.com/final-form/react-final-form (input states, use cases in examples)
- https://github.com/vacuumlabs/react-custom-validation (show validation recommendation)
- https://github.com/christianalfoni/formsy-react (convenience)
- https://github.com/erikras/redux-form (input states)

The package was created a moment before Formik and react-final-form were released. They're both good and this package is definitely not "an order of magnitude" better. I still use and maintain it because of simplicity (no duplicate API), i18n-friendliness and made conventions. I don't have to think about how to implement forms over and over.

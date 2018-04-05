# Implementation

## quick decisions

- `initialValues` as single object -> allow simply initial values to be set from response data

- methods on object instead of plain properties (not common in react community) -> allows higher order API, that is used only sometimes and is derived from core properties, it would be awkward and error prone to have many dynamic properties

## config prop as an object

what:
`Aptform` behavior can be changed by configuration prop `config` which is an object.

why:
Deep objects as props are ugly, but having a lot of props is worse, I think. I aimed for DX. If some form is behaving unexpectly, I can check a single prop and see clearly if its misconfigured. Try this with x shallow props that can be specified anywhere as attributes in jsx.

## lab status

- `preconfigure` as a helper to create pre-configured `Aptform` components
- submit error feature (todo: how to handle error text for the form/submit error)
- `formValidations`: should be only sync, async is a way edge case. also errors are still scoped to inputs, not to whole form. 

# Implementation

## config prop as an object

what:
`FormValues` behavior can be changed by configuration prop `config` which is an object.

why:
Deep objects as props are ugly, but having a lot of props is worse, I think. I aimed for DX. If some form is behaving unexpectly, I can check a single prop and see clearly if its misconfigured. Try this with x shallow props that can be specified anywhere as attributes in jsx.

## lab status

- `preconfigure` as a helper to create pre-configured `FormValues` components

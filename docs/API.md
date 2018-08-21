## Aptform props

### props

| Prop |  Type | Description |
| -------------- | ------ | --------------- |
| **render**       | Function | Function that is delegated to render the actual form and inputs. It receives an object of shape `RenderProps`. |
| **inputs**       | Object | Map of **input name** to input configuration object (shape of `InputConfig`). The value must be always an object, set an empty one if config for the input is unnecessary. Otherwise the input won't be available in arguments of the `render` prop function.  |
| config     | Object | Config for this form. Object properties are same as `ConfigureForms` props. |
| initialValues     | Object | Object mapping input names to input initial value. Each input defaults to an empty string otherwise. |
| onSubmit     | Function | Function to call when submitting is triggered. It receives an object mapping of input name to input value. It should return a Promise so the component knows whether its in submitting mode.  |

Only `render` and `inputs` are required as they are unique per form.

## InputConfig shape

| Property |  Type | Description |
| -------------- | ------ | --------------- |
|  validations      | Object | Mapping of validation name to validator function. Validation name is considered as id along the way. The validator function is passed only `value` argument. It should return `true` if the value is valid, otherwise `false`.  |
|  required      | boolean | Whether the input is required. Its copied to `RenderInputState.required`. |

## RenderProps shape

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| inputs       | Object | Mapping of input name to an object of input state (the shape is `RenderInputState`).  |
| form       | Object | See RenderFormState. |

## RenderFormState props

It has a convenient function `getPassProps` to get common form attributes (`onFocus`, `onBlur`, `onSubmit`). To know whether form is valid, you can use the `isValid()` method

Returns object of props that can be handily spread over typical inputs. Props are `name`, `value`, `onChange`, `required`. It works very well for inputs with type="text" and similar. It should work for custom UI libraries like `material-ui` as well.

However it doesn't work with react components for `radio` or `checkbox`. You have to manually set the props (see examples).

**Common fields**:

You must pass all these field to your form element.

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| onFocus     | Function | -  |
| onBlur     | Function | -  |
| onSubmit     | Function | -  |

You can get an object of these props by calling `RenderFormState.getPassProps()`.

**Custom fields**:

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| getPassProps     | Function | Convenient function that returns "Common fields".  |
| isValid     | Function | Returns true if all inputs are valid.  |
| hasChanged     | Function | Returns true if any input has changed.  |

## RenderInputState props

**Common fields**:

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| value     | string | Current value of the input.  |
| onChange     | Function | The input handler for `change` event.  |
| name     | string | Convenient prop to simply set the input name. Copied from keys of `inputs` prop. |
| required     | boolean | Convenient prop to set the `required` HTML attribute. Copied from config in `inputs` prop. |

You can get an object of these props by calling `RenderInputState.getPassProps()`.

**Custom fields**:

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| getPassProps     | Function | Convenient function that returns "Common fields".  |
| showError     | Function | Returns true if the validation framework decides an error should be visible to user. The decision is based on configuration of the form.  |
| showSuccess     | Function | See showError, returns true only if input is valid and should be visible to user.  |
| hasChanged     | Function | Returns `true` if the input has changed, otherwise `false`.  |
| clientErrors     | Object | Mapping of validation name to whether it failed. `true` means the input value *does have* an error for given validation. You can use it to render custom UI based on that errors. |

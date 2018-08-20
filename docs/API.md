## Aptform props

### props

| Prop |  Type | Description |
| -------------- | ------ | --------------- |
| **render**       | Function | Function that is delegated to render the actual form and inputs. It receives an object of shape `RenderProps`. |
| **inputs**       | Object | Map of **input name** to input configuration object (shape of `InputConfig`). The value must be always an object, set an empty one if config for the input is unnecessary. Otherwise the input won't be available in arguments of the `render` prop function.  |
| config     | Object | Config for this form. Object properties are same as `ConfigureForms` props. |
| initialValues     | Object | Map of input names to input initial value. |
| onSubmit     | Function | Function to call when submitting is triggered. It receives an object mapping of input name to input value. |

Only `render` and `inputs` are required as they are unique per form.

## RenderProps shape

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| inputs       | Object | Map of input name to an object of input state (the shape is `RenderInputState`).  |
| form       | Object | Object with handlers `onFocus`, `onBlur`, `onSubmit` and imperative callbacks `focusInput`, `blurInput`, `changeInput` to change an input state on your own. It also has a convenient function `getPassProps` to get common form attributes (`onFocus`, `onBlur`, `onSubmit`). To know whether form is valid, you can use the `isValid()` method. |


### `getPassProps() => Object `

Returns object of props that can be handily spread over typical inputs. Props are `name`, `value`, `onChange`, `required`. It works very well for inputs with type="text" and similar. It should work for custom UI libraries like `material-ui` as well.

However it doesn't work with react components for `radio` or `checkbox`. You have to manually set the props (see examples).

## InputConfig shape

| Property |  Type | Description |
| -------------- | ------ | --------------- |
|  validations      | Object | Map of a validation name to validator function. Validator is passed `value` and `formValues` arguments so the input value can be tested against other form values. It should return `true` if the value is valid, otherwise `false`.  |
|  required      | boolean | Whether the input is required. It will be copied to `RenderInputState.required`. |


## RenderInputState props

**Common fields**:

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| name     | string | Convenient prop to simply set the input name.  |
| value     | string | Current value of the input.  |
| onChange     | Function | The input handler for `change` event.  |
| required     | boolean | Convenient prop to set required attribute.  |

You can get an object of only these props by calling `RenderInputState.getPassProps()`.

**Custom fields**:

| Property |  Type | Description |
| -------------- | ------ | --------------- |
| showError     | Function | NOTE_REVIEW  |
| showSuccess     | Function | NOTE_REVIEW  |
| getPassProps     | Function | Convenient function that returns "Common fields".  |
| clientErrors     | Object | Mapping of validation name to whether it failed. `true` means the input value *does have* an error for given validation.  |
| hasChanged     | Function | Returns `true` if the input has changed, otherwise `false`.  |

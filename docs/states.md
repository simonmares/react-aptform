## Form states guide

### input states

| State |  Description | How |
| -------------- | ------ | --------------- |
| **input changed**       | Whether an input has changed from initial (either explicit or default one) value. | `input.hasChanged()`
| **input valid**       | Whether an input is valid. | `input.isValid()`
| **input has errors**       | Whether an input has errors. | not `input.isValid()`
| **input error should be displayed**       | You want to show an error only when user stops typing or on blur or on submit (must be configured with `config` prop). | `input.showError()`

### form states

| State |  Description | How |
| -------------- | ------ | --------------- |
| **form ready to submit**       | You want to allow submitting form only if user changed some input value. There must be no input errors. Form must not be already submitting. | `form.hasChanged()` + `form.isValid()` + not `form.isSubmitting()`|

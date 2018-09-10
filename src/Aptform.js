// @flow

import * as React from 'react';

import type {
  InputState,
  FormConfig,
  InputValue,
  EventType,
  InputConfig,
  PassProps,
  ValidationErrs,
  AsyncValidator,
  ValidationPolicyNames,
  LocalProps,
  LocalState,
  InitialValues,
} from './types.d';

import {
  sortByArray,
  mapObjVals,
  objValues,
  objValuesByKeys,
  filterObjValues,
  filterObj,
  isButton,
  getInputValue,
  nonNilOrDefault,
} from './utils';

const NO_ERROR_TEXT = '';
const DEFAULT_VALUE = '';

const valueEmpty = value => !value && value !== 0;

const warnUser = msg => {
  console.warn(msg);
};

const inputValueMethods = {
  showError() {
    // do not show while its changing
    if (this.changing) {
      return false;
    }
    return this.valid === false;
  },

  showSuccess() {
    return !this.pristine && (!this.changing || !this.focused) && this.valid === true;
  },

  // hasServerError() {
  //   // serverErrors are now nullable, set only if submit fails
  //   return !!this._serverErrors;
  // },

  hasError() {
    return this.valid === false;
  },

  hasChanged(initialValue: *) {
    return function() {
      if (initialValue) {
        return this.value !== initialValue;
      }
      return !this.pristine && this.value !== DEFAULT_VALUE;
    };
  },

  getPassProps({ onChange, required }) {
    return function(): PassProps {
      return {
        name: this.name,
        value: this.value,
        onChange,
        required,
      };
    };
  },

  isValid() {
    return this.valid === true;
  },

  isValidating() {
    return (this.valid === undefined && this.changing) || this.asyncValidating;
  },
};

const defaultConfig: FormConfig = {
  typeTimeout: 650,
  asyncTimeout: 500,
  failFast: false,
  resetOnSubmit: true,
  initialValid: false,
  joinChar: ', ',
  msgInvalid: 'This input is invalid.',
  msgRequired: 'This input is required.',
  msgFormInvalid: 'Form has errors.',
  msgUnknownError: 'Unknown error ocurred.',
  validationPolicy: {
    onMount: false,
    // NotePrototype(simon): add feat. or remove
    // onDelay: false,
    onBlur: true,
    onSubmit: true,
    onCreate: true,
    // onChange: true,
  },
};

const onErrorDefault = console.error.bind(console);

//
// Docs
//

// RuleIntialValueMustBeStr:
// if you initially pass undefined or null as the value prop, the component starts
// life as an "uncontrolled" component. Once you interact with the component,
// we set a value and react changes it to a "controlled" component, and issues the warning.
// https://github.com/twisty/formsy-react-components/issues/66

class Aptform<TInputNames: string> extends React.Component<
  LocalProps<TInputNames>,
  LocalState<TInputNames>
> {
  typingTimer: *;
  asyncTimer: *;
  validateTimer: *;

  props: LocalProps<TInputNames>;
  state: LocalState<TInputNames>;

  // In prototype if on development
  validateProps: *;

  onUnhandledRejection: *;

  onSubmit: *;
  onChange: *;
  onBlur: *;
  onFocus: *;

  onChangeInput: *;
  onFocusInput: *;
  onBlurInput: *;

  isFormValid: *;
  hasFormChanged: *;

  constructor(props: LocalProps<TInputNames>) {
    super(props);

    // bind event handlers
    this.onSubmit = this.onSubmit.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onBlur = this.onBlur.bind(this);
    this.onFocus = this.onFocus.bind(this);

    // bind imperative callbacks
    this.onChangeInput = this.onChangeInput.bind(this);
    this.onFocusInput = this.onFocusInput.bind(this);
    this.onBlurInput = this.onBlurInput.bind(this);

    // bind form callbacks
    this.isFormValid = this.isFormValid.bind(this);
    this.hasFormChanged = this.hasFormChanged.bind(this);

    // bind other cb
    this.onUnhandledRejection = this.onUnhandledRejection.bind(this);

    if (process.env.NODE_ENV !== 'production') {
      this.validateProps(props);
    }

    this.state = this.getInitialState(props, this.props.initialValues);
  }

  componentDidMount() {
    if (this.shouldValidate('onMount')) {
      this.updateAllInputsValidationState();
    }
  }

  componentWillUnmount() {
    this.clearAllTimers();
  }

  getInitialState(props: LocalProps<TInputNames>, initialValues: ?InitialValues<TInputNames>) {
    const inputNames = Object.keys(props.inputs);
    return {
      inputStates: this.initInputStates(inputNames, initialValues),
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      submitErrorText: '',
    };
  }

  getSortedValidationCodes(inputConfig: *) {
    const codesUnsorted: Array<string> = inputConfig.validations
      ? Object.keys(inputConfig.validations)
      : [];
    if (inputConfig.validationOrder && inputConfig.validationOrder.length) {
      return sortByArray(codesUnsorted, inputConfig.validationOrder);
    }
    return codesUnsorted;
  }

  getInputErrorText<TInputNames>(
    inputState: InputState<TInputNames>,
    inputConfig: InputConfig<TInputNames>,
    opts: { failFast: boolean, defaultText: string }
  ): string {
    // if its the 'required' error, we don't care about others and output this error directly.
    if (inputState.clientErrors.required) {
      return this.getFormConfigVal('msgRequired') || '';
    }

    if (inputConfig.getErrorText) {
      // $FlowFixMe
      return nonNilOrDefault(inputConfig.getErrorText(inputState), opts.defaultText);
    }

    const errorsMap = inputConfig.errorTextMap;
    if (errorsMap) {
      const hasError = (msg, isError) => isError === true;
      const errorsObject = { ...inputState.clientErrors, ...inputState._serverErrors };
      const allErrorCodes = Object.keys(filterObj(errorsObject, hasError));

      // Be defensive: should be called when an error exists, but it can happen.
      if (allErrorCodes.length === 0) {
        // no error => empty string
        return '';
      }

      const resolveErr = (err: string | ((i: InputState<TInputNames>) => string)) => {
        if (typeof err === 'function') {
          return err(inputState);
        }
        return err;
      };

      // Return first error if configured so
      if (opts.failFast) {
        // NoteReview: can sortedCodes be empty array?
        const sortedCodes = this.getSortedValidationCodes(inputConfig);
        const firstError = sortByArray(allErrorCodes, sortedCodes)[0];
        const errorText = errorsMap[(firstError: string)];
        return resolveErr(errorText);
      }

      const errorTexts = objValuesByKeys(errorsMap, allErrorCodes).map(resolveErr);
      if (errorTexts.length === 0) {
        return opts.defaultText;
      }
      // Return all errors concatenated
      const joinChar = this.getFormConfigVal('joinChar');
      return errorTexts.join(joinChar);
    }

    return opts.defaultText;
  }

  getInputText(inputName: TInputNames, inputState: *): string {
    const failFast = this.getFormConfigVal('failFast');
    const msgInvalid = this.getFormConfigVal('msgInvalid');
    if (inputState.valid === false) {
      const inputConfig = this.getInputConfig(inputName);
      const errorText = this.getInputErrorText(inputState, inputConfig, {
        failFast: failFast || false,
        defaultText: msgInvalid || '',
      });
      return errorText;
    }
    return '';
  }

  onSubmit(e: Event) {
    // Do not submit the form
    e.preventDefault();

    const { onSubmit } = this.props;
    if (!onSubmit) {
      // make sense only if syncing somehow (not implemented yet)
      return;
    }

    if (!this.isFormValid()) {
      if (this.shouldValidate('onSubmit')) {
        this.updateAllInputsValidationState();
      }

      this.setState({
        submitFailed: true,
        submitSucceeded: false,
        submitErrorText: this.getSubmitErrorText('formInvalid'),
      });
      return;
    }

    const inputValues = this.getAllFormValues();
    const submitPromise = onSubmit(inputValues);
    if (!submitPromise || !submitPromise.then) {
      warnUser('Call of onSubmit prop did not return Promise');
      return;
    }

    this.setState({ submitting: true });

    const handleErrors = (errors: { [TInputNames]: string }) => {
      const msgInvalid = this.getFormConfigVal('msgInvalid');
      const failFast = this.getFormConfigVal('failFast');

      // NoteReview: consider to optimize for more objects (unlikely to have 10s of objects)
      // its better to use single API. Do not set state in the loop.
      // Its okay for now. setState is batched and in most cases the errors will have 2-3 keys.
      for (const inputName of Object.keys(errors)) {
        const _serverErrors = { [errors[inputName]]: true };

        const updated = this.setInputState(inputName, { valid: false, _serverErrors });
        updated.then(() => {
          const inputState = this.getInputState(inputName);
          const inputConfig = this.getInputConfig(inputName);
          const errorText = this.getInputErrorText(inputState, inputConfig, {
            failFast: failFast || false,
            defaultText: msgInvalid || '',
          });
          this.setInputState(inputName, { valid: false, errorText });
        });
      }
    };

    const onErr = reason => {
      this.setState({ submitting: false, submitFailed: true, submitSucceeded: false });
      this.onUnhandledRejection(reason);
    };

    const onOk = (result = {}) => {
      // reset all previous submit states
      this.setState({
        submitting: false,
        submitFailed: false,
        submitSucceeded: false,
        submitErrorText: '',
      });

      if (result.data) {
        const resetData = { ...this.props.initialValues, ...result.data };
        this.resetFormState(this.props, resetData).then(() => {
          this.setState({ submitSucceeded: true });
        });
        return;
      } else if (result.errors || result.submitError) {
        const submitErrorText = this.getSubmitErrorText(
          result.submitError === true ? undefined : result.submitError
        );
        this.setState({ submitFailed: true, submitErrorText });
        if (result.errors) {
          handleErrors(result.errors);
        }
        return;
      } else {
        const resetOnSubmit = this.getFormConfigVal('resetOnSubmit');
        if (resetOnSubmit) {
          this.resetFormState(this.props, this.props.initialValues).then(() => {
            this.setState({ submitSucceeded: true });
          });
        }
        return;
      }
    };

    submitPromise.then(onOk, onErr);
  }

  onBlur(e: EventType) {
    const target = e.target;
    if (isButton(target)) {
      return;
    }

    const inputName = target.name;
    this.onBlurInput(inputName);
  }

  onBlurInput(inputName: TInputNames) {
    const changes = {
      focused: false,
      changing: false,
      touched: true,
    };

    this.setInputState(inputName, changes);
    if (this.shouldValidate('onBlur')) {
      this.runInputValidation(inputName);
    }
  }

  onFocus(e: EventType) {
    const target = e.target;
    if (isButton(target)) {
      return;
    }

    // We have to update `focused` only once so it makes sense to ask if its necessary
    const inputName = target.name;
    this.onFocusInput(inputName);
  }

  onFocusInput(name: TInputNames) {
    const { focused } = this.getInputState(name);
    if (!focused) {
      this.setInputState(name, { focused: true });
    }
  }

  onChange(e: EventType) {
    const target = e.target;
    const changedValue = getInputValue(target);
    if (changedValue !== undefined && changedValue !== null) {
      const inputName = ((target.name: any): TInputNames);
      this.changeInputValue(inputName, changedValue);
    }
  }

  onChangeInput(name: TInputNames, value: InputValue) {
    this.changeInputValue(name, value);
  }

  onGetFormPassProps() {
    return {
      onSubmit: this.onSubmit,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
    };
  }

  onUnhandledRejection(reason: *) {
    const onError = this.props.onError || onErrorDefault;
    onError(reason, 'promise rejection');
    const submitErrorText = this.getSubmitErrorText();
    this.setState({ submitFailed: true, submitErrorText });
  }

  onValidationThrown(
    error: Error,
    validation: string,
    input: { name: TInputNames, value: InputValue }
  ) {
    // NoteReview(simon): didWarn per validation
    const msg = `validating ${validation} for input name=${input.name} value=${input.value} threw`;
    const onError = this.props.onError || onErrorDefault;
    onError(error, msg);
  }

  getInputState(inputName: TInputNames): InputState<TInputNames> {
    // NoteReview: when can be undefined for given inputName?
    const inputState = this.state.inputStates[inputName];
    if (inputState) {
      return inputState;
    }

    warnUser(`No input with ${inputName}`);
    return this.createInputState({ name: inputName });
  }

  getInputConfig(inputName: TInputNames): InputConfig<TInputNames> {
    const { inputs } = this.props;
    if (inputs) {
      const config = inputs[inputName];
      if (config) {
        return config;
      }
    }
    // return a (valid) stub
    return { validations: {} };
  }

  shouldValidate(type: ValidationPolicyNames) {
    const policies = this.getFormConfigVal('validationPolicy');
    // $FlowFixMe: I know getFormConfigVal works
    return policies[type] === true;
  }

  isFormValid() {
    //
    // Returns whether form is valid unambiguously. It means if the input is invalid or
    // validity is unknown, it returns false.
    //

    const { inputStates } = this.state;
    const invalidInputExists = objValues(inputStates).some(input => input.valid !== true);
    if (invalidInputExists) {
      return false;
    }

    const { formValidations } = this.props;
    if (formValidations) {
      for (const input of objValues(inputStates)) {
        const priorValid = input.valid;
        const inputValues = this.getAllFormValues();
        for (const validators of objValues(formValidations)) {
          const clientErrors = mapObjVals(validators, validator => !validator(inputValues));
          const newErrors = filterObjValues(clientErrors, v => v === true);
          const hasNewErrors = newErrors.length > 0;
          const valid = !hasNewErrors && priorValid;
          if (!valid) {
            return false;
          }
        }
        return true;
      }
    }
    return true;
  }

  hasFormChanged() {
    for (const inputName of Object.keys(this.state.inputStates)) {
      const input = this.state.inputStates[inputName];
      if (input.hasChanged()) {
        return true;
      }
    }
    return false;
  }

  // Typing from https://github.com/facebook/flow/issues/2310
  getFormConfigVal<K: $Subtype<$Keys<FormConfig>>>(key: K): $ElementType<FormConfig, K> {
    // Returns config value with fallback to defaults. There is always a value for given
    // value key.
    // First it tries to find it in its props, then in context (from ConfigureForms) and
    // finally in defaultConfig. This is because using ConfigureForms is optional.

    // NoteReview
    const propConfig: FormConfig = this.props.config || defaultConfig;
    return nonNilOrDefault(propConfig[key], defaultConfig[key]);
  }

  getAllFormValues() {
    // => input name to value map.
    return mapObjVals(this.state.inputStates, is => is.value);
  }

  getSubmitErrorText(errorCode: string = 'unknownError'): string {
    const { errorTextMap } = this.props;
    const submitErrorText = (errorTextMap && errorTextMap[errorCode]) || '';
    if (submitErrorText === '') {
      const msgUnknownError = this.getFormConfigVal('msgUnknownError');
      const msgFormInvalid = this.getFormConfigVal('msgFormInvalid');
      const defaultErrorTexts = {
        unknownError: msgUnknownError,
        formInvalid: msgFormInvalid,
      };
      return defaultErrorTexts[errorCode] || '';
    }
    return submitErrorText;
  }

  setFormState(state: $Shape<LocalState<TInputNames>>): Promise<typeof undefined> {
    return new Promise(resolve => {
      this.setState(state, resolve);
    });
  }

  setInputState(
    inputName: TInputNames,
    props: $Shape<InputState<TInputNames>>
  ): Promise<typeof undefined> {
    const { inputStates } = this.state;

    const prevState = inputStates[inputName];
    const newState = {
      ...prevState,
      ...props,
    };
    const updatedInput = this.createInputState(newState);

    return new Promise(resolve => {
      this.setFormState({
        inputStates: {
          ...inputStates,
          [inputName]: updatedInput,
        },
      }).then(resolve);
    });
  }

  updateAllInputsValidationState() {
    const { inputStates } = this.state;
    for (const key of Object.keys(inputStates)) {
      this.runInputValidation(key);
    }
  }

  validateInputAsync(
    input: InputState<TInputNames>,
    validateAsync: AsyncValidator
  ): Promise<{ valid: boolean, errorCode: string }> {
    //
    // Runs all async validations for an input.
    // Returns a promise only when each validations settled.
    //

    const { value } = input;
    return validateAsync(value).then((result = {}) => {
      // NotePrototype(simon): handle not error cases....
      if (!result.asyncError) {
        return Promise.resolve({ valid: true, errorCode: '' });
      }

      const errorCode = result.asyncError === true ? 'unknownError' : result.asyncError;
      return Promise.resolve({
        valid: false,
        errorCode,
      });
    });
  }

  validateInputSync(
    inputValue: InputValue,
    inputName: TInputNames,
    opts: { failFast: boolean } = { failFast: false }
  ): [boolean, ValidationErrs] {
    const inputConfig = this.getInputConfig(inputName);
    const validationErrors = {};

    const isEmpty = valueEmpty(inputValue);
    if (inputConfig.required && isEmpty) {
      return [false, { required: true }];
    } else if (isEmpty) {
      return [true, {}];
    }

    let isValid = true;
    const validations = inputConfig && inputConfig.validations;
    if (validations) {
      for (const valKey of this.getSortedValidationCodes(inputConfig)) {
        // $FlowFixMe TInputNames is string
        const validateFunc = validations[valKey];
        let validationResult;
        try {
          validationResult = validateFunc(inputValue);
        } catch (e) {
          this.onValidationThrown(e, valKey, { name: inputName, value: inputValue });
          continue;
        }

        const hasError = !validationResult;
        validationErrors[valKey] = hasError;
        if (hasError && opts.failFast) {
          return [false, validationErrors];
        }
        if (hasError) {
          isValid = false;
        }
      }
    }

    return [isValid, validationErrors];
  }

  _updateErrorText(inputName: TInputNames) {
    const inputState = this.getInputState(inputName);
    this.setInputState(inputName, { errorText: this.getInputText(inputName, inputState) });
  }

  _runAsyncValidation({ inputName, inputState, validateAsync }: *, onValidated: Function) {
    // this.setInputState(inputName, {
    //   asyncValidating: true,
    // });

    const onValidateAsyncReady = () => {
      // reset timer if exists (debounce)
      this.asyncTimer && clearTimeout(this.asyncTimer);

      this.setInputState(inputName, {
        valid: undefined,
        asyncValidating: true,
      });

      const asyncValidated = this.validateInputAsync(inputState, validateAsync)
        .then(result => {
          if (!result.errorCode) {
            return this.setInputState(inputName, {
              valid: true,
              asyncValidating: false,
              _serverErrors: undefined,
            });
          }

          // input has changed, validation is not valid...
          const curInputState = this.getInputState(inputName);
          if (curInputState.value !== inputState.value) {
            return this.setInputState(inputName, {
              valid: true,
              _serverErrors: undefined,
            });
          }

          const { valid, errorCode } = result;
          return this.setInputState(inputName, {
            valid,
            _serverErrors: { [errorCode]: true },
          });
        })
        .catch(reason => {
          this.onUnhandledRejection(reason);
          return this.setInputState(inputName, {
            valid: true,
            asyncValidating: false,
          });
        });
      return asyncValidated.then(onValidated);
    };

    const asyncTimeout = this.getFormConfigVal('asyncTimeout');
    this.asyncTimer = setTimeout(onValidateAsyncReady, asyncTimeout);
  }

  validateFormWide({ validations, priorValid, inputName }: *): { clientErrors: *, isOk: boolean } {
    const inputValues = this.getAllFormValues();
    const clientErrors = mapObjVals(validations, validators =>
      mapObjVals(validators, validator => !validator(inputValues))
    );

    // for (const inputName of Object.keys(validations)) {
    // const validators = validations[inputName];
    // const newErrors = mapObjVals(validators, validator => !validator(inputValues));
    // clientErrors = { ...clientErrors, ...newErrors };

    // const hasNewErrors = newErrors.length > 0;

    // const oldState = this.getInputState(inputName);
    // const isValid = !hasNewErrors && priorValid;

    // this.setInputState(inputName, {
    //   clientErrors: { ...oldState.clientErrors, ...clientErrors },
    //   valid: isValid,
    // });
    // }

    const isOk = Object.keys(clientErrors).length > 0;
    return { clientErrors, isOk };
  }

  runInputValidation(inputName: TInputNames): Promise<*> {
    const failFast = this.getFormConfigVal('failFast') || false;

    const onValidated = () => {
      this._updateErrorText(inputName);
    };

    const inputState = this.getInputState(inputName);
    const [isValid, clientErrors] = this.validateInputSync(inputState.value, inputName, {
      failFast,
    });
    let valid = isValid;
    let allErrors = clientErrors;

    // validate asynchronously iff client validations pass and an async validation exist
    if (isValid && !inputState.pristine) {
      const validateAsync = this.getInputConfig(inputName).validateAsync;
      if (validateAsync) {
        // NoteReview(simon): must keep validating status of the input until Promise is settled
        this.setInputState(inputName, {
          asyncValidating: true,
        });

        this._runAsyncValidation(
          {
            inputName,
            inputState,
            validateAsync,
          },
          onValidated
        );
      }
    }

    const { formValidations } = this.props;
    if (formValidations) {
      const { isOk, clientErrors } = this.validateFormWide({
        validations: formValidations,
        priorValid: isValid,
        inputName,
      });
      valid = valid && isOk;
      allErrors = { ...allErrors, ...clientErrors };
    }

    const syncValidated = this.setInputState(inputName, {
      valid,
      clientErrors,
    });

    return syncValidated.then(onValidated);
  }

  clearAllTimers() {
    this.typingTimer && clearTimeout(this.typingTimer);
    this.asyncTimer && clearTimeout(this.asyncTimer);
    this.validateTimer && clearTimeout(this.validateTimer);
  }

  changeInputValue(inputName: TInputNames, value: InputValue) {
    const props = {
      // constants
      changing: true,
      pristine: false,
      // dynamic
      value,
      // reset
      // valid: undefined,
      touched: true,
    };

    this.setInputState(inputName, props).then(() => {
      const onDelayed = () => {
        this.setInputState(inputName, {
          valid: undefined,
          errorText: '',
          _serverErrors: undefined,
        });

        const updatedPromise = this.runInputValidation(inputName);
        const { onChange } = this.props;
        if (onChange) {
          updatedPromise.then(() => {
            onChange(inputName, value);
          });
        }
        if (this.typingTimer) {
          clearTimeout(this.typingTimer);
        }
        const onFinishedTyping = () => {
          this.setInputState(inputName, { changing: false });
        };
        const typeTimeout = this.getFormConfigVal('typeTimeout');
        this.typingTimer = setTimeout(onFinishedTyping, typeTimeout);
      };

      if (this.validateTimer) {
        clearTimeout(this.validateTimer);
      }
      this.validateTimer = setTimeout(onDelayed, 50);
    });
  }

  initInputStates(inputNameList: Array<TInputNames>, initialValues: ?InitialValues<TInputNames>) {
    const initialValid = this.getFormConfigVal('initialValid');
    const shouldValidate = this.shouldValidate('onCreate');
    const inputStates = {};
    for (const inputName of inputNameList) {
      // RuleIntialValueMustBeStr
      const value = (initialValues && initialValues[inputName]) || '';
      // by default, input is valid unless its in state of validating or has an error

      let valid;
      let clientErrors;
      if (initialValid) {
        valid = true;
      } else if (shouldValidate) {
        const [isValid, _clientErrors] = this.validateInputSync(value, inputName);
        clientErrors = _clientErrors;
        valid = isValid;
      }

      const props: $Shape<InputState<TInputNames>> = {
        value,
        valid,
        name: inputName,
        clientErrors,
      };
      const inputState = this.createInputState(props);
      inputStates[inputName] = inputState;

      // should add errorText if did validate
      if (shouldValidate) {
        inputState.errorText = this.getInputText(inputName, inputState);
      }
    }
    return inputStates;
  }

  createInputState(fromProps: $Shape<InputState<TInputNames>>): InputState<TInputNames> {
    const initialValues = this.props.initialValues || {};
    const onFormChange = this.onChange;
    const inputName = fromProps.name;
    const inputConfig = this.getInputConfig(inputName);

    const required = inputConfig.required || false;

    const initial = initialValues[inputName];
    const inputState: $Shape<InputState<TInputNames>> = {
      name: fromProps.name,

      // nullable props
      valid: fromProps.valid,
      _serverErrors: fromProps._serverErrors,

      // non-nullable props
      value: nonNilOrDefault(fromProps.value, DEFAULT_VALUE),
      touched: nonNilOrDefault(fromProps.touched, false),
      focused: nonNilOrDefault(fromProps.focused, false),
      pristine: nonNilOrDefault(fromProps.pristine, true),
      changing: nonNilOrDefault(fromProps.changing, false),
      errorText: nonNilOrDefault(fromProps.errorText, NO_ERROR_TEXT),
      clientErrors: nonNilOrDefault(fromProps.clientErrors, {}),
      //
      asyncValidating: nonNilOrDefault(fromProps.asyncValidating, false),
    };

    // methods
    inputState.showError = inputValueMethods.showError.bind(inputState);
    inputState.showSuccess = inputValueMethods.showSuccess.bind(inputState);
    inputState.hasError = inputValueMethods.hasError.bind(inputState);

    // NoteReview: reconsider API
    inputState.isValid = inputValueMethods.isValid.bind(inputState);
    inputState.isValidating = inputValueMethods.isValidating.bind(inputState);
    inputState.hasChanged = inputValueMethods.hasChanged(initial).bind(inputState);

    // NOTE_PROTOTYPE: this is a bit weird
    inputState.getPassProps = inputValueMethods
      .getPassProps({ onChange: onFormChange, required })
      .bind(inputState);
    inputState.onChange = onFormChange.bind(inputState);

    return inputState;
  }

  resetFormState(
    props: LocalProps<TInputNames>,
    initialValues: ?InitialValues<TInputNames>
  ): Promise<typeof undefined> {
    this.clearAllTimers();
    const initialState = this.getInitialState(props, initialValues);
    return this.setFormState(initialState);
  }

  render() {
    const { inputStates, submitting, submitFailed, submitErrorText, submitSucceeded } = this.state;
    const form = {
      // form state getters
      isValid: this.isFormValid,
      hasChanged: this.hasFormChanged,
      isSubmitting: () => submitting,

      // Event handlers
      onSubmit: this.onSubmit,
      onFocus: this.onFocus,
      onBlur: this.onBlur,

      // Direct API
      changeInput: this.onChangeInput,
      blurInput: this.onBlurInput,
      focusInput: this.onFocusInput,
      getPassProps: this.onGetFormPassProps,

      // direct state
      submitting,
      submitFailed,
      submitSucceeded,
      submitErrorText,
    };
    return this.props.render({ inputs: inputStates, form });
  }
}

if (process.env.NODE_ENV !== 'production') {
  Aptform.prototype.validateProps = function(props: LocalProps<*>) {
    if (!props.onSubmit) {
      warnUser('You have to provide onSubmit prop.');
    }
    if (!props.render) {
      warnUser('Prop `render` is missing.');
    }
    if (!props.inputs) {
      warnUser('Prop `inputs` is missing.');
    }
    if ('children' in props) {
      warnUser('Aptform does not accept children prop.');
    }

    //
    // Checking for initialValues vs inputs mismatches
    //

    const initialKeys = new Set(Object.keys(props.initialValues || {}));
    const inputKeys = new Set(Object.keys(props.inputs));

    function isSuperset(set, subset) {
      for (var elem of subset) {
        if (!set.has(elem)) {
          return false;
        }
      }
      return true;
    }

    if (!isSuperset(inputKeys, initialKeys)) {
      function difference(setA, setB) {
        var _difference = new Set(setA);
        for (var elem of setB) {
          _difference.delete(elem);
        }
        return _difference;
      }

      const extraKeys = Array.from(difference(initialKeys, inputKeys)).join(', ');
      warnUser(`Extra keys in \`initialValues\`: [${extraKeys}] missing in \`inputs\`.`);
    }
  };
}

export default Aptform;

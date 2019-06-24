// @flow

import type {
  InputState,
  FormConfig,
  InputValue,
  EventType,
  InputConfig,
  PassProps,
  ValidationErrs,
  ValidationPolicyNames,
  LocalProps,
  LocalState,
  InputNames,
  InitialValues,
} from './types';

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

const valueEmpty = (value) => !value && value !== 0;

const warnUser = (msg) => {
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
    return this.valid === undefined && this.changing;
  },
};

const defaultConfig: FormConfig = {
  typeTimeout: 650,
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

type Listener = (LocalState) => void;

class Aptform {
  typingTimer: *;
  validateTimer: *;

  _listeners: Array<Listener>;

  props: LocalProps;
  state: LocalState;

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

  constructor(props: LocalProps) {
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

    this.props = props;
    this.state = this.getInitialState(props, props.initialValues);
    this._listeners = [];
  }

  componentDidMount() {
    if (this.shouldValidate('onMount')) {
      this.updateAllInputsValidationState();
    }
  }

  componentWillUnmount() {
    this.clearAllTimers();
  }

  getInitialState(props: LocalProps, initialValues: ?InitialValues<InputNames>) {
    const inputNames = Object.keys(props.inputs);
    return {
      inputStates: this.initInputStates(inputNames, initialValues),
      submitting: false,
      submitFailed: false,
      submitSucceeded: false,
      submitErrorText: '',
    };
  }

  getSortedValidationCodes(inputConfig: *): Array<string> {
    const codesUnsorted: Array<string> = inputConfig.validations
      ? Object.keys(inputConfig.validations)
      : [];
    if (inputConfig.validationOrder && inputConfig.validationOrder.length) {
      return sortByArray(codesUnsorted, inputConfig.validationOrder);
    }
    return codesUnsorted;
  }

  getInputErrorText(
    inputState: InputState,
    inputConfig: InputConfig,
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

      const resolveErr = (err: string | ((i: InputState) => string)) => {
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

  getInputText(inputName: InputNames, inputState: *): string {
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

    const handleErrors = (errors: { [InputNames]: string }) => {
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

    const onErr = (reason) => {
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

  onBlurInput(inputName: InputNames) {
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

  onFocusInput(name: InputNames) {
    const { focused } = this.getInputState(name);
    if (!focused) {
      this.setInputState(name, { focused: true });
    }
  }

  onChange(e: EventType) {
    const target = e.target;
    const changedValue = getInputValue(target);
    if (changedValue !== undefined && changedValue !== null) {
      const inputName = ((target.name: any): InputNames);
      this.changeInputValue(inputName, changedValue);
    }
  }

  onChangeInput(name: InputNames, value: InputValue) {
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
    input: { name: InputNames, value: InputValue }
  ) {
    // NoteReview(simon): didWarn per validation
    const msg = `validating ${validation} for input name=${input.name} value=${input.value} threw`;
    const onError = this.props.onError || onErrorDefault;
    onError(error, msg);
  }

  getInputState(inputName: InputNames): InputState {
    // NoteReview: when can be undefined for given inputName?
    const inputState = this.state.inputStates[inputName];
    if (inputState) {
      return inputState;
    }

    warnUser(`No input with ${inputName}`);
    return this.createInputState({ name: inputName });
  }

  getInputConfig(inputName: InputNames): InputConfig {
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
    const invalidInputExists = objValues(inputStates).some((input) => input.valid !== true);
    if (invalidInputExists) {
      return false;
    }

    const { formValidations } = this.props;
    if (formValidations) {
      for (const input of objValues(inputStates)) {
        const priorValid = input.valid;
        const inputValues = this.getAllFormValues();
        for (const validators of objValues(formValidations)) {
          const clientErrors = mapObjVals(validators, (validator) => !validator(inputValues));
          const newErrors = filterObjValues(clientErrors, (v) => v === true);
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

  getFormConfigVal(key: string): any {
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
    return mapObjVals(this.state.inputStates, (is) => is.value);
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

  setFormState(state: $Shape<LocalState>): Promise<typeof undefined> {
    return new Promise((resolve) => {
      this.setState(state, resolve);
    });
  }

  setInputState(inputName: InputNames, props: $Shape<InputState>): Promise<typeof undefined> {
    const { inputStates } = this.state;

    const prevState = inputStates[inputName];
    const newState = {
      ...prevState,
      ...props,
    };
    const updatedInput = this.createInputState(newState);

    return new Promise((resolve) => {
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

  validateInputSync(
    inputValue: InputValue,
    inputName: InputNames,
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
        // $FlowFixMe InputNames is string
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

  _updateErrorText(inputName: InputNames) {
    const inputState = this.getInputState(inputName);
    this.setInputState(inputName, { errorText: this.getInputText(inputName, inputState) });
  }

  validateFormWide({ validations, priorValid, inputName }: *): { clientErrors: *, isOk: boolean } {
    const inputValues = this.getAllFormValues();
    const clientErrors = mapObjVals(validations, (validators) =>
      mapObjVals(validators, (validator) => !validator(inputValues))
    );
    const isOk = Object.keys(clientErrors).length > 0;
    return { clientErrors, isOk };
  }

  runInputValidation(inputName: InputNames): Promise<*> {
    const failFast = this.getFormConfigVal('failFast') || false;

    const onValidated = () => {
      this._updateErrorText(inputName);
    };

    const inputState = this.getInputState(inputName);
    const [isValid, clientErrors] = this.validateInputSync(inputState.value, inputName, {
      failFast,
    });
    let valid = isValid;
    // let allErrors = clientErrors;

    const { formValidations } = this.props;
    if (formValidations) {
      const { isOk, clientErrors } = this.validateFormWide({
        validations: formValidations,
        priorValid: isValid,
        inputName,
      });
      valid = valid && isOk;
      // allErrors = { ...allErrors, ...clientErrors };
    }

    const syncValidated = this.setInputState(inputName, {
      valid,
      clientErrors,
    });

    return syncValidated.then(onValidated);
  }

  clearAllTimers() {
    this.typingTimer && clearTimeout(this.typingTimer);
    this.validateTimer && clearTimeout(this.validateTimer);
  }

  changeInputValue(inputName: InputNames, value: InputValue) {
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

  initInputStates(inputNameList: Array<InputNames>, initialValues: ?InitialValues<InputNames>) {
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

      const props: $Shape<InputState> = {
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

  createInputState(fromProps: $Shape<InputState>): InputState {
    const initialValues = this.props.initialValues || {};
    const onFormChange = this.onChange;
    const inputName = fromProps.name;
    const inputConfig = this.getInputConfig(inputName);

    const required = inputConfig.required || false;

    const initial = initialValues[inputName];
    const inputState: $Shape<InputState> = {
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
    props: LocalProps,
    initialValues: ?InitialValues<InputNames>
  ): Promise<typeof undefined> {
    this.clearAllTimers();
    const initialState = this.getInitialState(props, initialValues);
    return this.setFormState(initialState);
  }

  setState(update: $Shape<LocalState> | null, cb?: () => void): void {
    // Do not update state for null
    if (update == null) {
      if (cb) {
        cb();
      }
      return;
    }
    // Update state and notify
    const updatedState = { ...this.state, ...update };
    this.state = updatedState;
    if (cb) {
      cb();
    }
  }

  subscribe(fn: Listener) {
    this._listeners.push(fn);
  }

  unsubscribe(fn: Listener) {
    this._listeners = this._listeners.filter((f) => f !== fn);
  }
}

if (process.env.NODE_ENV !== 'production') {
  Aptform.prototype.validateProps = function(props: LocalProps) {
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

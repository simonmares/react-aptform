// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import type {
  InputState,
  FormState,
  FormConfig,
  InputValue,
  PassProps,
  ValidationErrs,
} from './apt-form-flow.d';

import * as objutils from './objutils';

type TInputNames = string;

type InputConfig<TInputNames> = {|
  validations?: { [key: TInputNames]: validationFunc<TInputNames> },
  required?: boolean,
  // => getError
  errorText?: (input: InputState<TInputNames>) => ?string,
  getErrorFromMap?: (input: InputState<TInputNames>) => { [string]: boolean },
|};

// Stub type for need of this file
type InputEvent = {
  // HTMLInputElement
  target: HTMLInputElement,
};

type NotifyFn = Function;
type EventHandler = (e: Event) => void;
type AnyInputValue = any;

type InputMap<TKeys, TValues> = { [TKeys]: TValues };
type FormValuesMap<TKeys> = InputMap<TKeys, AnyInputValue>;

type validationFunc<TInputNames> = (value: any, formValues: FormValuesMap<TInputNames>) => boolean;

type FormPassProps = {|
  onFocus: EventHandler,
  onBlur: EventHandler,
  onSubmit: NotifyFn,
|};

type RenderProps<TInputNames> = {|
  inputs: InputMap<TInputNames, InputState<TInputNames>>,
  form: {|
    ...FormState,
    ...FormPassProps,
    submitting: boolean,
    changeInput: (name: string, value: InputValue) => void,
    blurInput: (name: string) => void,
    focusInput: (name: string) => void,
    getPassProps: () => FormPassProps,
    // NOTE_REVIEW: onChange should be per input, because controlled inputs
    // must have onChange
    // or rename to something better
    // onChange: EventHandler,
  |},
|};

type LocalState<TInputNames> = {|
  inputStates: { [TInputNames]: InputState<TInputNames> },
  submitting: boolean,
|};

type LocalProps<TInputNames> = {
  id?: string,
  syncToStore?: boolean,
  inputsAreDynamic?: boolean,

  // config override prop object?
  config: FormConfig,

  inputs: { [TInputNames]: InputConfig<TInputNames> | null },
  // Not required, fallback through defaultProps
  initialValues?: FormValuesMap<TInputNames>,

  // can return anything
  render: (props: RenderProps<TInputNames>) => React.Element<any>,

  // NOTE_REVIEW: type of promise
  onSubmit?: (values: FormValuesMap<TInputNames>) => void,
  // NOTE_REVIEW: usefulness?
  onChange?: (name: string, value: any) => void,
};

const NO_ERROR_TEXT = '';
const DEFAULT_VALUE = '';
const IS_DEV = process.env.NODE_ENV !== 'production';

const isEmpty = value => !value && value !== 0;
const isButton = element => arrayIncludes(['submit', 'reset', 'button', 'menu'], element.type);
const numValueOrUndef = numValue => (Number.isNaN(numValue) ? numValue : undefined);

const arrayIncludes = (array, item) => {
  return array.indexOf(item) !== -1;
};

type getInputValueF = (element: HTMLInputElement) => ?InputValue;
const getInputValue: getInputValueF = element => {
  if (element.type === 'checkbox') {
    return element.checked;
  }

  if (arrayIncludes(['number', 'range'], element.type)) {
    const numValue = parseFloat(element.value);
    // NaN evaluates to false,
    return numValue ? numValue : numValueOrUndef(numValue);
  }

  return element.value;
};

function nonNilOrDefault<T>(val: T, defaultVal: T): T {
  return val !== undefined && val !== null ? val : defaultVal;
}

const warnUser = msg => {
  console.warn(msg);
};

const inputValueMethods = {
  showError() {
    return !this.pristine && (!this.changing || !this.focused) && this.valid === false;
  },

  showSuccess() {
    return !this.pristine && (!this.changing || !this.focused) && this.valid === true;
  },

  hasServerError() {
    // serverErrors are now nullable, set only if submit fails
    return !!this._serverErrors;
  },

  hasError() {
    if (this.pristine) {
      return false;
    }

    return this.valid === false;
  },

  hasValidated() {
    return this.valid !== undefined;
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
        value: this.value || DEFAULT_VALUE,
        onChange,
        required,
      };
    };
  },

  isValid() {
    return this.valid === true;
  },
};

function getInputErrorText<TInputNames>(
  inputState: InputState<TInputNames>,
  inputConfig,
  opts: { failFast: boolean, defaultText: string }
): string {
  if (inputConfig.errorText) {
    // $FlowFixMe
    return inputConfig.errorText(inputState) || '';
  } else if (inputConfig.getErrorFromMap) {
    const errorsMap = inputConfig.getErrorFromMap(inputState);
    const hasError = (msg, isError) => isError === true;

    // Return first error
    if (opts.failFast) {
      const result = objutils.findObj(errorsMap, hasError);
      if (result) {
        const [errMsg] = result;
        return errMsg;
      }
    }

    // Return all errors concatenated
    // NOTE_REVIEW: join with?
    return Object.keys(objutils.filterObj(errorsMap, hasError)).join(', ');
  }

  return opts.defaultText;
}

const defaultConfig: FormConfig = {
  typeTimeout: 650,
  failFast: false,
  msgInvalid: 'This input is invalid.',
};

const isObject = (key, value) => value instanceof Object;

export class FormValues<TInputNames: string> extends React.Component<
  LocalProps<TInputNames>,
  LocalState<TInputNames>
> {
  static defaultProps = {
    config: defaultConfig,
  };

  static contextTypes = {
    registerForm: PropTypes.func,
    aptFormConfig: PropTypes.object,
  };

  typingTimerId: *;
  props: LocalProps<TInputNames>;
  state: LocalState<TInputNames>;

  context: {
    aptFormConfig: $Shape<FormConfig>,
    registerForm?: Function,
  };

  // In prototype if on development
  validateProps: *;

  // RULE_INTIAL_VALUE_MUST_BE_STR:
  // if you initially pass undefined or null as the value prop, the component starts
  // life as an "uncontrolled" component. Once you interact with the component,
  // we set a value and react changes it to a "controlled" component, and issues the warning.
  // https://github.com/twisty/formsy-react-components/issues/66

  onSubmit: *;
  onChange: *;
  onBlur: *;
  onFocus: *;

  onChangeInput: *;
  onFocusInput: *;
  onBlurInput: *;

  syncForm: ({ [TInputNames]: InputState<TInputNames> }) => void;
  unregisterForm: *;

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

    if (IS_DEV && typeof this.validateProps === 'function') {
      this.validateProps(props);
    }

    this.state = this.getInitialState(props, this.props.initialValues);
  }

  componentDidMount() {
    const { id, syncToStore } = this.props;
    if (syncToStore) {
      const { registerForm } = this.context;
      if (!registerForm) {
        return warnUser('You passed syncToStore but FormStore was not found in component tree.');
      }

      const registerCbs = registerForm(id, this.state.inputStates);
      this.syncForm = registerCbs.syncForm;
      this.unregisterForm = registerCbs.unregisterForm;
    }

    // NOTE_REVIEW: always/conditionally ?
    if (this.props.initialValues) {
      this.updateAllInputsValidationState();
    }
  }

  componentWillReceiveProps(nextProps: LocalProps<TInputNames>) {
    const { inputsAreDynamic } = this.props;
    const shouldReconfigure =
      inputsAreDynamic && !objutils.shallowEquals(nextProps.inputs, this.props.inputs);
    if (shouldReconfigure) {
      const initialValues = this.getAllFormValues();
      this.resetFormState(nextProps, initialValues);
    }
  }

  componentWillUnmount() {
    const { syncToStore } = this.props;
    if (syncToStore) {
      if (this.unregisterForm) {
        this.unregisterForm();
      }

      delete this.unregisterForm;
      delete this.syncForm;
    }
  }

  getInitialState(props: LocalProps<TInputNames>, initialValues: ?FormValuesMap<TInputNames>) {
    const validInputNames = Object.keys(objutils.filterObj(props.inputs, isObject));
    return {
      inputStates: this.createInputStateMap(validInputNames, initialValues),
      submitting: false,
    };
  }

  onSubmit(e: Event) {
    // Do not submit the form
    e.preventDefault();

    const { onSubmit } = this.props;
    if (!onSubmit) {
      return;
    }

    const inputValues = this.getAllFormValues();
    const submitPromise = onSubmit(inputValues);
    if (!submitPromise || !submitPromise.then) {
      warnUser('Call of onSubmit prop did not return Promise');
      return;
    }

    this.setState({ submitting: true });

    const onOk = () => {
      this.setState({ submitting: false });
      // NoteReview: what values it should be reseted => new test
      this.resetFormState(this.props, this.props.initialValues);
    };

    const onErr = errs => {
      this.setState({ submitting: false });

      const msgInvalid = this.getFormConfigVal('msgInvalid');
      const failFast = this.getFormConfigVal('failFast');

      const msgExpectedErrorsObject =
        'Promise returned from onSubmit did not reject with errors object.';
      if (typeof errs !== 'object') {
        warnUser(msgExpectedErrorsObject);
        return;
      }

      // NOTE_REVIEW: optimize for more objects (unlikely to have 10s of objects)
      // its better to use single API. Do not set state in the loop.
      // Its okay for now. setState is batched and in most cases the errs will have 2-3 keys.
      for (const inputName of Object.keys(errs)) {
        const _serverErrors = errs[inputName];

        // NOTE_REVIEW: handle _serverErrors is not an object.
        if (typeof _serverErrors !== 'object') {
          warnUser(msgExpectedErrorsObject);
          continue;
        }

        const updated = this.setInputState(inputName, { valid: false, _serverErrors });
        updated.then(() => {
          const inputState = this.getInputState(inputName);
          const inputConfig = this.getInputConfig(inputName);
          const errorText = getInputErrorText(inputState, inputConfig, {
            failFast: failFast || false,
            defaultText: msgInvalid || '',
          });
          this.setInputState(inputName, { valid: false, errorText });
        });
      }
    };
    submitPromise.then(onOk, onErr);
  }

  onBlur(e: InputEvent) {
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

    this.setInputState(inputName, changes).then(() => {
      // Sync synchronously!
      const { syncToStore } = this.props;
      if (syncToStore) {
        this.syncForm(this.state.inputStates);
      }
    });
  }

  onFocus(e: InputEvent) {
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

  onChange(e: InputEvent) {
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

  getInputState(inputName: TInputNames): InputState<TInputNames> {
    // NOTE_REVIEW: when can be undefined for given inputName?
    const inputState = this.state.inputStates[inputName];
    if (inputState) {
      return inputState;
    }

    warnUser(`No input with ${inputName}`);
    return this.createInputState({ name: inputName });
  }

  getInputConfig(inputName: TInputNames): InputConfig<TInputNames> {
    const config = this.props.inputs[inputName];
    if (!config) {
      if (IS_DEV) {
        if (!inputName) {
          warnUser('Have you set a name prop for all your inputs?');
        } else {
          warnUser(`Have you passed config for input \`${inputName}\` in inputs prop?`);
        }
      }

      // return a stub
      return { validations: {} };
    }
    return config;
  }

  getFormState(): FormState {
    const isValid = () => {
      for (const inputName of Object.keys(this.state.inputStates)) {
        const input = this.state.inputStates[inputName];
        const [isValid] = this.validateInput(input, true);
        if (!isValid) {
          return false;
        }
      }
      return true;
    };

    const hasChanged = () => {
      for (const inputName of Object.keys(this.state.inputStates)) {
        const input = this.state.inputStates[inputName];
        if (input.hasChanged()) {
          return true;
        }
      }
      return false;
    };

    return {
      isValid,
      hasChanged,
    };
  }

  // Typing from https://github.com/facebook/flow/issues/2310
  getFormConfigVal<K: $Subtype<$Keys<FormConfig>>>(key: K): $ElementType<FormConfig, K> {
    // Returns config value with fallback to defaults. There is always a value for given
    // value key.
    // First it tries to find it in its props, then in context (from ConfigureForms) and
    // finally in defaultConfig. This is because using ConfigureForms is optional.

    // NoteReview
    const propConfig: FormConfig = this.props.config || defaultConfig;
    const contextConfig: FormConfig = this.context.aptFormConfig || defaultConfig;
    return nonNilOrDefault(
      propConfig[key],
      nonNilOrDefault(contextConfig[key], defaultConfig[key])
    );
  }

  getAllFormValues() {
    // => input name to value map.
    return objutils.mapObjVals(this.state.inputStates, is => is.value);
  }

  // NOTE_REVIEW: should return promise? or be similar as native setState?
  setFormState(state: $Shape<LocalState<TInputNames>>, onDone: *) {
    this.setState(state, onDone);

    if (this.props.syncToStore) {
      this.syncInputStates();
    }
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

    if (this.props.syncToStore) {
      this.syncInputStates();
    }

    return new Promise(resolve => {
      this.setFormState(
        {
          inputStates: {
            ...inputStates,
            [inputName]: updatedInput,
          },
        },
        resolve
      );
    });
  }

  // NOTE_REVIEW: unnecessary because of onBlur syncs
  syncInputStates() {
    const delayed = () => {
      this.syncForm(this.state.inputStates);
    };

    setTimeout(delayed, 50);
  }

  updateAllInputsValidationState() {
    const { inputStates } = this.state;
    for (const key of Object.keys(inputStates)) {
      this.updateInputValidationState(key);
    }
  }

  validateInput(
    input: InputState<TInputNames>,
    failFast: boolean = false
  ): [boolean, ValidationErrs] {
    const inputConfig = this.getInputConfig(input.name);
    const validations = inputConfig && inputConfig.validations;

    const { value } = input;

    if (inputConfig.required && isEmpty(value)) {
      return [false, { required: true }];
    }

    const valErrs = {};

    let isValid = true;
    if (validations) {
      const allValues = this.getAllFormValues();

      for (const valKey of Object.keys(validations)) {
        const validate = validations[valKey];

        const hasError = !validate(value, allValues);
        valErrs[valKey] = hasError;
        if (hasError && failFast) {
          return [false, valErrs];
        }
        if (hasError) {
          isValid = false;
        }
      }
    }

    return [isValid, valErrs];
  }

  updateInputValidationState(inputName: TInputNames): Promise<*> {
    const failFast = this.getFormConfigVal('failFast');

    const onValidated = () => {
      const inputState = this.getInputState(inputName);
      const msgInvalid = this.getFormConfigVal('msgInvalid');
      if (inputState.valid === false) {
        const inputState = this.getInputState(inputName);
        const inputConfig = this.getInputConfig(inputName);
        const errorText = getInputErrorText(inputState, inputConfig, {
          failFast: failFast || false,
          defaultText: msgInvalid || '',
        });
        this.setInputState(inputName, { errorText });
      }
    };

    const inputState = this.getInputState(inputName);
    const [isValid, clientErrors] = this.validateInput(inputState, failFast);
    const validationPromise = this.setInputState(inputName, {
      changing: false,
      valid: isValid,
      clientErrors,
    });

    return validationPromise.then(onValidated);
  }

  clearAllTimers() {
    if (this.typingTimerId) {
      clearTimeout(this.typingTimerId);
    }
  }

  changeInputValue(inputName: TInputNames, value: InputValue) {
    const props = {
      value,
      changing: true,
      valid: undefined,
      errorText: '',
      pristine: false,
      touched: true,
    };

    this.setInputState(inputName, props);

    if (this.typingTimerId) {
      clearTimeout(this.typingTimerId);
    }
    const onFinishedTyping = () => {
      this.setInputState(inputName, { changing: false });
      const updatedPromise = this.updateInputValidationState(inputName);
      const { onChange } = this.props;
      if (onChange) {
        updatedPromise.then(() => {
          onChange(inputName, value);
        });
      }
    };
    const typeTimeout = this.getFormConfigVal('typeTimeout');
    this.typingTimerId = setTimeout(onFinishedTyping, typeTimeout);
  }

  isFormValid() {
    const { inputStates } = this.state;
    for (const key of Object.keys(inputStates)) {
      const i = inputStates[key];
      if (i.hasError()) {
        return false;
      }
    }
    return true;
  }

  // NOTE_REVIEW: add typing
  createInputStateMap(
    inputNameList: Array<TInputNames>,
    initialValues: ?FormValuesMap<TInputNames>
  ) {
    const inputStates = {};
    for (const inputName of inputNameList) {
      // RULE_INTIAL_VALUE_MUST_BE_STR
      const value = (initialValues && initialValues[inputName]) || '';
      const props: $Shape<InputState<TInputNames>> = { value, name: inputName };
      const inputValue = this.createInputState(props);
      inputStates[inputName] = inputValue;
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
    };

    // methods
    inputState.showError = inputValueMethods.showError.bind(inputState);
    inputState.showSuccess = inputValueMethods.showSuccess.bind(inputState);
    inputState.hasError = inputValueMethods.hasError.bind(inputState);

    // NOTE_REVIEW
    inputState.hasServerError = inputValueMethods.hasServerError.bind(inputState);
    inputState.isValid = inputValueMethods.isValid.bind(inputState);
    inputState.hasValidated = inputValueMethods.hasValidated.bind(inputState);

    // NOTE_PROTOTYPE:
    inputState.hasChanged = inputValueMethods.hasChanged(initial).bind(inputState);
    inputState.getPassProps = inputValueMethods
      .getPassProps({ onChange: onFormChange, required })
      .bind(inputState);
    inputState.onChange = onFormChange.bind(inputState);

    return inputState;
  }

  resetFormState(props: LocalProps<TInputNames>, initialValues) {
    this.clearAllTimers();
    const initialState = this.getInitialState(props, initialValues);
    this.setFormState(initialState);
  }

  render() {
    const { inputStates, submitting } = this.state;
    const formState = this.getFormState();
    const form = {
      // form state getters
      isValid: formState.isValid,
      hasChanged: formState.hasChanged,

      // Functions
      onSubmit: this.onSubmit,
      onFocus: this.onFocus,
      onBlur: this.onBlur,
      changeInput: this.onChangeInput,
      blurInput: this.onBlurInput,
      focusInput: this.onFocusInput,
      getPassProps: this.onGetFormPassProps,
      submitting,
    };
    return this.props.render({ inputs: inputStates, form });
  }
}

if (IS_DEV) {
  FormValues.prototype.validateProps = function(props: LocalProps<*>) {
    const submitOrSync = props.onSubmit || props.syncToStore;
    if (!submitOrSync) {
      warnUser('You either have to provide onSubmit prop or syncToStore.');
    }
    if (props.syncToStore && !props.id) {
      warnUser('You provided syncToStore but not id prop.');
    }
    if (!props.inputs) {
      warnUser('Prop inputs is missing');
    }
    if (!props.render) {
      warnUser('Prop render is missing');
    }
    if (props.children) {
      warnUser('FormValues does not accept children prop.');
    }
    if (props.errorText && props.getErrorFromMap) {
      warnUser('You should provide either errorText or getErrorFromMap.');
    }
  };
}

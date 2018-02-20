// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import * as objutils from './objutils';

import type { InputState, InputValue } from './apt-form-flow.d';

type InputStatesMap = { [string]: InputState<string> };
type FormDataMap = { [string]: InputValue };

type getAllFormsT = () => { [string]: FormDataMap };
type getFormT = (formName: string) => FormDataMap;

type LocalProps = {|
  render: ({ getAllForms?: getAllFormsT, getForm: getFormT }) => React.Element<any>,
|};

const IS_DEV = process.env.NODE_ENV !== 'production';
const warnUser = msg => {
  console.warn(msg);
};

class FormStore extends React.Component<LocalProps, void> {
  static defaultProps: *;
  onGetForm: *;
  onGetAllForms: *;
  onRegisterForm: *;
  onUnregisterForm: *;

  storedForms: { [string]: InputStatesMap };

  // iff IS_DEV
  validateProps: *;

  constructor(props: LocalProps) {
    super(props);

    if (IS_DEV && typeof this.validateProps === 'function') {
      this.validateProps(props);
    }

    this.onGetForm = this.onGetForm.bind(this);
    this.onGetAllForms = this.onGetAllForms.bind(this);
    this.onRegisterForm = this.onRegisterForm.bind(this);
    this.onUnregisterForm = this.onUnregisterForm.bind(this);

    this.storedForms = {};
  }

  onGetAllForms() {
    return objutils.mapObjVals(this.storedForms, storedForm => {
      return objutils.mapObjVals(storedForm, is => is.value);
    });
  }

  onGetForm(formName: string) {
    // NOTE_REVIEW: Can be undefined if not connected yet (warning?, runtime error)
    const storedForm = this.storedForms[formName] || {};
    return objutils.mapObjVals(storedForm, is => is.value);
  }

  onRegisterForm(formName: string, initialData: InputStatesMap) {
    this.storedForms[formName] = initialData || {};

    const syncForm = (formData: *) => {
      // NOTE_REVIEW:
      if (this.storedForms[formName]) {
        delete this.storedForms[formName];
      }

      this.storedForms[formName] = formData;
    };

    return { syncForm, unregisterForm: this.onUnregisterForm };
  }

  onUnregisterForm(formName: string) {
    delete this.storedForms[formName];
  }

  getChildContext() {
    return { registerForm: this.onRegisterForm };
  }

  render() {
    const { render } = this.props;
    return render({ getForm: this.onGetForm, getAllForms: this.onGetAllForms });
  }
}

FormStore.childContextTypes = {
  registerForm: PropTypes.func,
};

if (IS_DEV) {
  FormStore.prototype.validateProps = function(props: LocalProps) {
    if (props.children) {
      warnUser('FormStore does not accept children prop.');
    }
  };
}

export default FormStore;

// @flow

import * as React from 'react';

import Aptform from './aptform/Aptform';
import type { LocalProps, LocalState } from './aptform/types';

class AptformReact extends React.Component<LocalProps, LocalState> {
  aptformInstance: Aptform;

  unsubscribe: Function;

  constructor(props: LocalProps) {
    super(props);

    this.aptformInstance = new Aptform(props);
    this.state = this.aptformInstance.state;

    const updateState = (val) => this.updateState(val);
    this.aptformInstance.subscribe(updateState);
    this.unsubscribe = () => this.aptformInstance.unsubscribe(updateState);
  }

  // componentDidMount() {
  // }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
  }

  updateState(val: LocalState): Promise<void> {
    // NotePrototype: add is mount check?
    return new Promise((resolve) => {
      this.setState(val, resolve);
    });
  }

  render() {
    const { inputStates, submitting, submitFailed, submitErrorText, submitSucceeded } = this.state;
    const form = {
      // form state getters
      isValid: this.aptformInstance.isFormValid,
      hasChanged: this.aptformInstance.hasFormChanged,
      isSubmitting: () => submitting,

      // Event handlers
      onSubmit: this.aptformInstance.onSubmit,
      onFocus: this.aptformInstance.onFocus,
      onBlur: this.aptformInstance.onBlur,

      // Direct API
      changeInput: this.aptformInstance.onChangeInput,
      blurInput: this.aptformInstance.onBlurInput,
      focusInput: this.aptformInstance.onFocusInput,
      getPassProps: this.aptformInstance.onGetFormPassProps,

      // direct state
      submitting,
      submitFailed,
      submitSucceeded,
      submitErrorText,
    };
    return this.props.render({ inputs: inputStates, form });
  }
}

export default AptformReact;

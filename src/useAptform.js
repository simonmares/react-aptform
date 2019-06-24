// @flow

import { useMemo, useState, useEffect } from 'react';

import Aptform from './aptform/Aptform';
import type { LocalProps } from './aptform/types';

export function useAptform(props: LocalProps) {
  //
  // Create Aptform instance (only once for now)
  //

  // NoteReview(simon): when the instance should be recreated?
  const inst: Aptform = useMemo(() => new Aptform(props), []);
  const [state, setState] = useState(inst.state);

  //
  // Subscribe on "mount"
  //

  useEffect(() => {
    let isActive = true;

    function onUpdate() {
      if (isActive) {
        setState(inst.state);
      }
    }

    inst.subscribe(onUpdate);
    if (inst.shouldValidate('onMount')) {
      inst.updateAllInputsValidationState();
    }

    return () => {
      isActive = false;
      inst.unsubscribe(onUpdate);
      inst.cleanup();
    };
  }, []);

  //
  // render
  //

  const { inputStates, submitting, submitFailed, submitErrorText, submitSucceeded } = state;
  const form = {
    // form state getters
    isValid: inst.isFormValid,
    hasChanged: inst.hasFormChanged,
    isSubmitting: () => submitting,
    // Event handlers
    onSubmit: inst.onSubmit,
    onFocus: inst.onFocus,
    onBlur: inst.onBlur,
    // Direct API
    changeInput: inst.onChangeInput,
    blurInput: inst.onBlurInput,
    focusInput: inst.onFocusInput,
    getPassProps: inst.onGetFormPassProps,
    // direct state
    submitting,
    submitFailed,
    submitSucceeded,
    submitErrorText,
  };

  return { inputs: inputStates, form };
}

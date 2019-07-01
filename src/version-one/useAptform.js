// @flow

import { useMemo, useState, useEffect } from 'react';

import { Aptform } from '../version-one/Aptform';
import type { LocalProps } from '../version-one/types';

function createLocalState(inst, newState) {
  const { inputStates, submitting, submitFailed, submitErrorText, submitSucceeded } = newState;
  const form = {
    // form state getters
    isValid: inst.isFormValid.bind(inst),
    hasChanged: inst.hasFormChanged.bind(inst),
    isSubmitting: () => submitting,
    // Event handlers
    onSubmit: inst.onSubmit.bind(inst),
    onFocus: inst.onFocus.bind(inst),
    onBlur: inst.onBlur.bind(inst),
    // Direct API
    changeInput: inst.onChangeInput.bind(inst),
    blurInput: inst.onBlurInput.bind(inst),
    focusInput: inst.onFocusInput.bind(inst),
    getPassProps: inst.onGetFormPassProps.bind(inst),
    // direct state
    submitting,
    submitFailed,
    submitSucceeded,
    submitErrorText,
  };
  return { inputs: inputStates, form };
}

export function useAptform(props: LocalProps) {
  //
  // Create Aptform instance (only once for now)
  //

  // NoteReview(simon): when the instance should be recreated?
  const inst: Aptform = useMemo(() => new Aptform(props), []);
  const [localState, setLocalState] = useState(() => createLocalState(inst, inst.state));

  //
  // Subscribe on "mount"
  //

  useEffect(() => {
    let isActive = true;

    function onUpdate(newState) {
      if (isActive) {
        setLocalState(createLocalState(inst, newState));
      }
    }

    // inst.setup();
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

  return localState;
}

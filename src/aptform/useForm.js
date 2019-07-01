// @flow

import { useMemo, useState, useEffect } from 'react';

import { createForm } from './Form';
import type { Form, FormProps } from './Form';
// import type { Input } from './Input';

// NOTE: just a mock implementation for development

type InputType = {||};

type FormType = {||};

type useFormProps = FormProps;
type useFormType = {|
  form: any,
  inputs: any,
  // alternatives: API, methods, apt (imperative API)
  aptform: any,
|};

type LocalState = useFormType;

function createLocalState(form: Form): LocalState {
  return {
    form: form,
    inputs: {},
    aptform: {},
  };
}

export function useForm(props: useFormProps): useFormType {
  //
  // Create Aptform instance (only once for now)
  //

  // NoteReview(simon): when the instance should be recreated?
  const inst: Form = useMemo(() => createForm(props), []);
  const [localState, setLocalState] = useState(() => createLocalState(inst));

  //
  // Subscribe on "mount"
  //

  useEffect(() => {
    let isActive = true;

    function onUpdate() {
      if (isActive) {
        setLocalState(createLocalState(inst));
      }
    }

    // inst.setup();
    const unsubscribe = inst.subscribe(onUpdate);

    // if (inst.shouldValidate('onMount')) {
    //   inst.updateAllInputsValidationState();
    // }

    return () => {
      isActive = false;
      unsubscribe();
      inst.cleanup();
    };
  }, []);

  //
  // render
  //

  return localState;
}

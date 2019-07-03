// @flow

import { useMemo, useState, useEffect } from 'react';

import { createForm } from '../aptform/Form';
import type { Form, FormProps } from '../aptform/Form';
// import type { AptConfig } from './types';
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

export function mapObjVals(obj: *, mapFunc: *) {
  const mappedObj = {};
  for (const key of Object.keys(obj)) {
    mappedObj[key] = mapFunc(obj[key]);
  }
  return mappedObj;
}

function createLocalState(form: Form): LocalState {
  return {
    form: {
      getPassProps: () => {
        return {
          onSubmit: form.onSubmit.bind(form),
          onFocus: form.onFocus.bind(form),
          onBlur: form.onBlur.bind(form),
        };
      },
    },
    inputs: mapObjVals(form.inputInstances, (input) => {
      return {
        // NotePrototype(simon): should be resolved here
        getPassProps: input.getPassProps,
      };
    }),
    aptform: {},
  };
}

export function useForm(props: useFormProps): useFormType {
  //
  // Create form instance (only once for now)
  //

  // NoteReview(simon): when the instance should be recreated?
  const inst: Form = useMemo(() => createForm(props), []);

  const [localState, setLocalState] = useState(createLocalState(inst));

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

    // ???
    const cleanup = inst.setup();
    const unsubscribe = inst.subscribe(onUpdate);

    // if (inst.shouldValidate('onMount')) {
    //   inst.updateAllInputsValidationState();
    // }

    return () => {
      isActive = false;
      unsubscribe();
      cleanup();
    };
  }, []);

  //
  // render
  //

  return localState;
}

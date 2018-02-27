// @flow

import * as React from 'react';

import FormValues from './FormValues';
import FormStore from './FormStore';

import type { FormConfig } from './apt-form-flow.d';
import type { LocalProps } from './FormValues';

export function preconfigure(
  preConfig: $Shape<FormConfig>
): React.ComponentType<LocalProps<*> & { componentRef?: any }> {
  // Note: componentRef is only for tests
  return class FormValuesConfigured extends React.Component<LocalProps<*> & { componentRef: any }> {
    render() {
      const { config, componentRef } = this.props;
      const mergedConfig = { ...preConfig, ...config };
      return <FormValues ref={componentRef} {...this.props} config={mergedConfig} />;
    }
  };
}

export { FormStore, FormValues };

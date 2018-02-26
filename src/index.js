// @flow

import * as React from 'react';

import FormValues from './FormValues';
import FormStore from './FormStore';
import ConfigureForms from './ConfigureForms';

import type { FormConfig } from './apt-form-flow.d';
import type { LocalProps } from './FormValues';

function preconfigure(
  defaultConfig: $Shape<FormConfig>
): React.ComponentType<LocalProps<*> & { componentRef: any }> {
  return class FormValuesConfigured extends React.Component<LocalProps<*> & { componentRef: any }> {
    render() {
      const { config, componentRef } = this.props;
      const mergedConfig = { ...config, ...defaultConfig };
      return <FormValues ref={componentRef} {...this.props} config={mergedConfig} />;
    }
  };
}

export { FormStore, FormValues, ConfigureForms, preconfigure };

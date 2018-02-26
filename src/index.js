// @flow

import * as React from 'react';

import FormValues from './FormValues';
import FormStore from './FormStore';

import type { FormConfig } from './apt-form-flow.d';
import type { LocalProps } from './FormValues';

export function preconfigure(
  preConfig: $Shape<FormConfig>
): React.ComponentType<LocalProps<*> & { componentRef: any }> {
  // Note: componentRef is for tests
  return class FormValuesConfigured extends React.Component<LocalProps<*> & { componentRef: any }> {
    render() {
      const { config, componentRef } = this.props;
      const mergedConfig = { ...preConfig, ...config };
      return <FormValues ref={componentRef} {...this.props} config={mergedConfig} />;
    }
  };
}

type childrenType = React.Element<*>;

export function ConfigureForm(props: { children: childrenType }) {
  const { children, ...configProps } = props;
  const childrenProps = children.props;
  const mergedProps = { ...childrenProps, config: { ...configProps, ...childrenProps.config } };
  return React.cloneElement(children, mergedProps, childrenProps.children);
}

export { FormStore, FormValues };

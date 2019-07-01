// @flow

import * as React from 'react';

import Aptform from './version-one/AptformReact';

import type { FormConfig } from './version-one/types';

export function preconfigure(
  preConfig: $Shape<FormConfig>
): React.ComponentType<React.ElementConfig<typeof Aptform> & { componentRef?: any }> {
  // Note: componentRef is only for tests
  return class AptformConfigured extends React.Component<
    React.ElementConfig<typeof Aptform> & { componentRef: any }
  > {
    render() {
      const { config, componentRef } = this.props;
      const mergedConfig = { ...preConfig, ...config };
      return <Aptform ref={componentRef} {...this.props} config={mergedConfig} />;
    }
  };
}

export { Aptform };

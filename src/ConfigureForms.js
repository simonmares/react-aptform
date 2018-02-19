// @flow

import * as React from 'react';
import PropTypes from 'prop-types';

import type { FormConfig } from './apt-form-flow.d';

type LocalProps = {|
  ...FormConfig,
  children: any,
|};

class ConfigureForms extends React.Component<LocalProps, void> {
  static defaultProps: *;
  getConfig(): FormConfig {
    const { typeTimeout, failFast, msgInvalid } = this.props;
    return {
      typeTimeout,
      failFast,
      msgInvalid,
    };
  }

  getChildContext() {
    const aptFormConfig = this.getConfig();
    return { aptFormConfig };
  }

  render() {
    return React.Children.only(this.props.children);
  }
}

ConfigureForms.childContextTypes = {
  aptFormConfig: PropTypes.object,
};

export default ConfigureForms;

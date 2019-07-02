// @flow

import type { AptConfig } from './types';
import { nonNil } from './utils';

export function resolveConfig(props?: $Shape<AptConfig> = {}): AptConfig {
  return {
    initiallyValid: nonNil(props.initiallyValid, true),
  };
}

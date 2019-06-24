// @flow

import { useAptform } from './useAptform';

import type { LocalProps } from './aptform/types';

function AptformReact(props: LocalProps) {
  const aptform = useAptform(props);
  return props.render(aptform);
}

export default AptformReact;

// @flow

import { useAptform } from './useAptform';

import type { LocalProps, RenderFn } from './aptform/types';

function AptformReact(props: LocalProps & { render: RenderFn }) {
  const aptform = useAptform(props);
  return props.render(aptform);
}

export default AptformReact;

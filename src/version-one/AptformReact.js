// @flow

import { useAptform } from '../version-one/useAptform';

import type { LocalProps, RenderFn } from '../version-one/types';

function AptformReact(props: LocalProps & { render: RenderFn }) {
  const aptform = useAptform(props);
  return props.render(aptform);
}

export default AptformReact;

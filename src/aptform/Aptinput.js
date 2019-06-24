// @flow

type AptinputProps = {|
  name: string,
|};

type AptinputState = {|
  value: string,
|};

export class Aptinput {
  props: AptinputProps;
  state: AptinputState;

  constructor(props: AptinputProps) {
    this.state = { value: '' };
  }
}

// @flow

import * as React from 'react';

// project
import type { InputState } from '../src/apt-form-flow.d';

type ScalarValue = number | string | boolean | Date;

export class PrettyPrintObject extends React.Component<{ value: { [string]: ScalarValue } }> {
  // pretty prints shallow objects

  renderBoolean(val: boolean) {
    return <span>{String(val)}</span>;
  }

  renderNil(val: ?null) {
    return <span title={val}>?</span>;
  }

  renderDate(val: Date) {
    return <span title={val.toISOString()}>{new Intl.DateTimeFormat().format(val)}</span>;
  }

  renderString(val: string) {
    return <span>'{val}'</span>;
  }

  renderValue(val: ScalarValue) {
    if (typeof val === 'boolean') {
      return this.renderBoolean(val);
    } else if (typeof val === 'string') {
      return this.renderString(val);
    } else if (val instanceof Date) {
      return this.renderDate(val);
    } else if (typeof val === 'number') {
      return val;
    }

    return this.renderNil(val);
  }

  render() {
    const { value } = this.props;
    return (
      <div>
        {Object.keys(value).map(key => {
          const val = value[key];
          return (
            <div>
              {key}: {this.renderValue(val)}
            </div>
          );
        })}
      </div>
    );
  }
}

export const yesNo = (bool: boolean) => <span>{bool ? 'yes' : 'no'}</span>;
export const yesNoUndef = (maybeBool: ?boolean) => {
  if (typeof maybeBool === 'boolean') {
    return yesNo(maybeBool);
  }

  return <span>?</span>;
};

type TestCaseProps = { title: string, desc: string, children: React.Node };
export function TestCase({ title, desc, children }: TestCaseProps) {
  return (
    <div>
      <h2>{title}</h2>
      <p style={{ color: '#A9A9A9' }}>{desc}</p>
      {children}
    </div>
  );
}

type DebugStateInputP = {|
  inputState: InputState<*>,

  // input props
  ...Object,
|};

export class DebugStateInput extends React.Component<DebugStateInputP> {
  shouldComponentUpdate(nextProps: DebugStateInputP) {
    return this.props.inputState !== nextProps.inputState;
  }

  render() {
    const { inputState, ...passProps } = this.props;
    return (
      <div>
        <div>
          <strong>{passProps.name}</strong>
        </div>
        <div>.valid: {yesNoUndef(inputState.valid)}</div>

        <div>.focused: {yesNo(inputState.focused)}</div>
        <div>.touched: {yesNo(inputState.touched)}</div>
        <div>.pristine: {yesNo(inputState.pristine)}</div>
        <div>.changing: {yesNo(inputState.changing)}</div>

        <div>.hasError(): {yesNo(inputState.hasError())}</div>
        <div>.showError(): {yesNo(inputState.showError())}</div>
        <div>.showSuccess(): {yesNo(inputState.showSuccess())}</div>
        <div>.hasChanged(): {yesNo(inputState.hasChanged())}</div>

        <div>.errorText: {inputState.errorText}</div>
        <div>
          <input {...passProps} />
        </div>
      </div>
    );
  }
}

// @flow

import * as React from 'react';

// project
import type { InputState } from '../src/types.d';

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
            <div key={key}>
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
      <div style={{ color: '#A9A9A9' }}>{desc}</div>
      {children}
    </div>
  );
}

class FormattedText extends React.Component<*, *> {
  render() {
    const lines = this.props.text.split('\n');
    return lines.map(l => <div>{l}</div>);
  }
}

export function ExampleVariantDeliminer() {
  return <hr style={{ margin: '1em 0 0', borderColor: '#ffe7f4' }} />;
}

export function ExampleVariantInfo(props: { title: string, desc: string }) {
  return (
    <div>
      <h2>{props.title}</h2>
      <div style={{ color: '#A9A9A9' }}>
        <FormattedText text={props.desc} />
      </div>
    </div>
  );
}

export function ExampleInfo(props: { title: string, desc: string }) {
  return (
    <div>
      <h1>{props.title}</h1>
      <div style={{ color: '#A9A9A9', margin: '0 0 1rem' }}>
        <FormattedText text={props.desc} />
      </div>
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

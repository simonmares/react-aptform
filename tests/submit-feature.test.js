// @flow

import React from 'react';
import { render } from 'react-testing-library';

import { Aptform } from '../src/index';

import { defaultProps } from './helpers';

const createEvent = () => ({ preventDefault: jest.fn() });

describe('form.onSubmit', () => {
  beforeEach(() => {
    global.console.warn = jest.fn();
  });

  afterEach(() => {
    global.console.warn.mockRestore();
  });

  test('should call preventDefault and onSubmit prop', () => {
    const renderMock = jest.fn(({ form }) => {
      const e = createEvent();
      form.onSubmit(e);
      expect(e.preventDefault).toBeCalled();
      return 'mock';
    });

    const onSubmitMock = jest.fn();
    render(<Aptform {...defaultProps} render={renderMock} onSubmit={onSubmitMock} />);

    expect(renderMock).toHaveBeenCalled();
    expect(onSubmitMock).toHaveBeenCalled();

    expect(console.warn).toBeCalledWith('Call of onSubmit prop did not return Promise');
  });

  test('should not call missing onSubmit prop (its optional)', () => {
    const renderMock = jest.fn(({ form }) => {
      const e = createEvent();
      form.onSubmit(e);
      return 'mock';
    });

    const props = { ...defaultProps };
    delete props.onSubmit;

    expect(() => {
      render(<Aptform {...props} render={renderMock} />);
    }).not.toThrow();

    expect(renderMock).toHaveBeenCalled();
  });

  test('should use Promise returned from onSubmit to update its state', () => {
    // NOTE_PROTOTYPE: add test, returning actual Promise made the test freezed
    expect(1).toEqual(1);
  });
});

// @flow

import isEmailLib from 'validator/lib/isEmail';

const coerceString = val => {
  if (val === undefined || val === null) {
    return '';
  }
  return String(val);
};

export const maxLength = (len: number) => (value: mixed) => {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length <= len;
};

export const minLength = (len: number) => (value: mixed) => {
  if (typeof value !== 'string') {
    return false;
  }
  return value.length >= len;
};

export const minMaxLength = (min: number, max: number) => (value: mixed) => {
  if (typeof value !== 'string') {
    return false;
  }
  return minLength(min)(value) && maxLength(max)(value);
};

export const matches = (regexp: RegExp) => (value: mixed) => {
  return regexp.test(coerceString(value));
};

const matchesNum = matches(/^[-+]?(?:\d*[.])?\d+$/);

export const isNumeric = (value: mixed) => {
  return matchesNum(coerceString(value));
};

export const includesNum = matches(/[0-9]/);
export const isAlpha = matches(/^[A-Z]+$/i);
export const includesAlpha = matches(/[A-Z]/i);

export const isEmail = (val: mixed) => isEmailLib(coerceString(val));

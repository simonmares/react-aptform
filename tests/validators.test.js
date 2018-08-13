// @flow

import * as unit from '../src/validators';

test('maxLength(0)', () => {
  const validate = unit.maxLength(0);
  // True
  expect(validate('')).toEqual(true);
  // False
  expect(validate()).toEqual(false);
  expect(validate('x')).toEqual(false);
});

test('maxLength(1)', () => {
  const validate = unit.maxLength(1);
  // True
  expect(validate('x')).toEqual(true);
  expect(validate('')).toEqual(true);
  // False
  expect(validate()).toEqual(false);
  expect(validate('xy')).toEqual(false);
});

test('minLength(0)', () => {
  const validate = unit.minLength(0);
  // True
  expect(validate('x')).toEqual(true);
  expect(validate('')).toEqual(true);
  // False
  expect(validate()).toEqual(false);
});

test('minLength(1)', () => {
  const validate = unit.minLength(1);
  // False
  expect(validate()).toEqual(false);
  expect(validate('')).toEqual(false);
  // True
  expect(validate('x')).toEqual(true);
  expect(validate('xy')).toEqual(true);
});

test('minMaxLength(1, 2)', () => {
  const validate = unit.minMaxLength(1, 2);
  // False
  expect(validate()).toEqual(false);
  expect(validate('xyz')).toEqual(false);
  // True
  expect(validate('x')).toEqual(true);
  expect(validate('xy')).toEqual(true);
});

test('matches(/email/)', () => {
  const validate = unit.matches(/email/);
  // False
  expect(validate()).toEqual(false);
  expect(validate('')).toEqual(false);
  // True
  expect(validate('email')).toEqual(true);
  expect(validate('emailXXX')).toEqual(true);
  expect(validate('XXXemailXXX')).toEqual(true);
  expect(validate('XXXemail')).toEqual(true);
});

test('isNumeric', () => {
  const validate = unit.isNumeric;
  // False
  expect(validate()).toEqual(false);
  expect(validate('x')).toEqual(false);
  expect(validate(NaN)).toEqual(false);
  expect(validate('x101x')).toEqual(false);
  // True
  expect(validate('102')).toEqual(true);
  expect(validate(101)).toEqual(true);
});

test('includesNum', () => {
  const validate = unit.includesNum;
  // False
  expect(validate()).toEqual(false);
  expect(validate('x')).toEqual(false);
  expect(validate(NaN)).toEqual(false);
  // True
  expect(validate('102')).toEqual(true);
  expect(validate(101)).toEqual(true);
  expect(validate('x101x')).toEqual(true);
});

test('isAlpha', () => {
  const validate = unit.isAlpha;
  // False
  expect(validate()).toEqual(false);
  expect(validate('x101x')).toEqual(false);
  expect(validate('102')).toEqual(false);
  // True
  expect(validate('x')).toEqual(true);
});

test('includesAlpha', () => {
  const validate = unit.includesAlpha;
  // False
  expect(validate()).toEqual(false);
  expect(validate('102')).toEqual(false);
  // True
  expect(validate('x101x')).toEqual(true);
  expect(validate('x')).toEqual(true);
});

test('isEmail', () => {
  const validate = unit.isEmail;
  // False
  expect(validate()).toEqual(false);
  expect(validate(123)).toEqual(false);
  expect(validate('xzy')).toEqual(false);
  // True
  expect(validate('x101x@example.com')).toEqual(true);
  expect(validate('x@example.com')).toEqual(true);
});

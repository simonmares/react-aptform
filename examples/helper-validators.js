// @flow

export const isEmailNaive = (value: string) => !!value.match(/\w+@\w+\.[A-Z]+/i);

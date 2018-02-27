// @flow

export const isEmailNaive = (value: string) => !!value.match('[A-Z]+@[A-Z]+.[A-Z]+');

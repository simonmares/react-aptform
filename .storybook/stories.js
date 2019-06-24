// @flow weak

// WARNING: This file was generated, do not modify it manually.

// To update, just run:
// npx whys-scripts export-storybook-config

/* eslint-disable import/no-extraneous-dependencies */

import * as React from 'react';
import { storiesOf } from '@storybook/react';
import { action } from '@storybook/addon-actions';

function isPlainObject(val) {
  const str = Object.prototype.toString.call(val);
  if (str !== '[object Object]') {
    return false;
  }
  return true;
}

function warnNonObject(path) {
  console.warn(`Expected ${path.join(' -> ')} to be a plain object.`);
}

function warnNonFunction(path) {
  console.warn(`Expected ${path.join(' -> ')} to be a function.`);
}

const rootFileName = 'storybook.js';
const isDev = process.env.NODE_ENV === 'development';

function addStories(
  domainName /*: string */,
  scopeName /*: string */,
  examples /*: { [string]: (props: { action: Function }) => () => React.Node }*/
) {
  const name = `${domainName} ${scopeName}`;
  const storybook = storiesOf(name, module);

  let didError = false;

  for (const exampleName of Object.keys(examples)) {
    const story = examples[exampleName];
    if (typeof story === 'function') {
      storybook.add(exampleName, () => story({ action }));
    } else {
      const path = [rootFileName, domainName, scopeName, exampleName];
      warnNonFunction(path);
      if (didError === false) {
        didError = true;
      }
    }
  }

  return didError;
}

function alertError() {
  window.alert('Failed to load all examples. \nPlease check your console.');
}

function main(allExamples) {
  if (!allExamples || !isPlainObject(allExamples)) {
    console.warn('No examples exist.');
    console.info(
      '(hint): Please export an object in <ROOT>/examples/storybook.js as a default export.'
    );
    alertError();
    return;
  }

  // Desired behavior:
  // - show only one alert
  // - show as much as possible (e.g. to validate all)
  let didError;
  const setDidError = () => {
    if (!didError) {
      didError = true;
    }
  };

  for (const domainName of Object.keys(allExamples)) {
    const domainExamples = allExamples[domainName];

    if (isDev && !isPlainObject(domainExamples)) {
      warnNonObject([rootFileName, domainName]);
      setDidError();
      continue;
    }

    for (const scopeName of Object.keys(domainExamples)) {
      const examples = domainExamples[scopeName];
      if (isDev && !isPlainObject(examples)) {
        warnNonObject([rootFileName, domainName, scopeName]);
        setDidError();
        continue;
      }
      const addStoriesErrored = addStories(domainName, scopeName, examples);
      if (addStoriesErrored) {
        setDidError();
      }
    }
  }

  if (didError) {
    alertError();
  }
}

const allExamples = require('../examples/storybook.js');
main(allExamples.default);
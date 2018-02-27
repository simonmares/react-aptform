// @flow

/* eslint-disable import/no-extraneous-dependencies */

// import * as React from 'react';
import { storiesOf, action } from '@storybook/react';

import * as examples from '../examples';

const storybook = storiesOf('FormValues', module);

for (const key of Object.keys(examples)) {
  const story = examples[key];
  const name = story.displayName || key;
  storybook.add(name, story({ action }));
}

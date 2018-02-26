// @flow

/* eslint-disable import/no-extraneous-dependencies */

import * as React from 'react';
import { storiesOf, action } from '@storybook/react';

import * as examples from '../examples';

storiesOf('FormValues', module)
  .add('Basic with debug', examples.BasicExample({ action }))
  .add('With validations', examples.WithValidations({ action }))
  .add('With 100 inputs', examples.WithLotInputs({ action }))
  .add('With sync to store', examples.WithSyncToStore({ action }))
  .add('With ConfigureForms config', examples.WithConfigureForms({ action }))
  .add('With dynamic inputs', examples.WithDynamicInputs({ action }))
  .add('Gist docs example', examples.GistDocsExample({ action }))
  .add('All supported input types', examples.WithAllInputTypes({ action }));


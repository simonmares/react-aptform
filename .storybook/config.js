import { configure } from '@storybook/react';
import '@storybook/addon-actions/register';

function loadStories() {
  require('./stories.js');
}

configure(loadStories, module);

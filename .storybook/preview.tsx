import React from 'react';
import { Provider } from 'react-redux';
import store from '../src/services/store';
import type { Preview } from '@storybook/react';
import { BrowserRouter } from 'react-router-dom';
import { appTheme } from './theme';
import '@krgaa/react-developer-burger-ui-components';
import '../src/index.css';
const preview: Preview = {
  parameters: {
    docs: {
      theme: appTheme,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      test: 'todo',
    },
  },
  decorators: [
    (Story) => (
      <Provider store={store}>
        <BrowserRouter>
          <div style={{ padding: 20 }}>
            <Story />
          </div>
        </BrowserRouter>
      </Provider>
    ),
  ],
};
export default preview;

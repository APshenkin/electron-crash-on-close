// eslint-disable-next-line no-unused-vars
import hook from './lib/css-modules';
import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'react-router-redux';
import { createMemoryHistory } from 'history';
import routes from './routes';
import configureStore from './store';

// eslint-disable-next-line no-unused-vars
import styles from './global.css';
// eslint-disable-next-line no-unused-vars
import 'roboto-npm-webfont';

// eslint-disable-next-line
window.eval = global.eval = function() {
  throw new Error('Cnot support window.eval() for security reasons.');
};

const initialState = {
  settings: {
    isTest: true,
  }
};
const routerHistory = createMemoryHistory();
const store = configureStore(initialState, routerHistory);

const rootElement = document.querySelector(document.currentScript.getAttribute('data-container'));

ReactDOM.render(
  <Provider store={store}>
    <ConnectedRouter history={routerHistory}>
      {routes}
    </ConnectedRouter>
  </Provider>,
  rootElement
);

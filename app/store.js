import  { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import { routerMiddleware, routerReducer as routing, push } from 'react-router-redux';
import thunk from 'redux-thunk';
import createLogger from 'redux-logger';

import windowMiddleware from './middlewares/window';

import windowActions from './redux-modules/window';

export default function configureStore(initialState, routerHistory) {
  const router = routerMiddleware(routerHistory);

  const actionCreators = {
    ...windowActions,
    push
  };

  const reducers = {
    routing,
    settings: (state = {}) => state,
  };

  const middlewares = [
    thunk,
    windowMiddleware,
    router
  ];

  if (process.env.NODE_ENV === 'development') {
    middlewares.push(createLogger());
  }

  const composeEnhancers = (() => {
    const compose_ = window && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;

    if (process.env.NODE_ENV === 'development' && compose_) {
      return compose_({ actionCreators });
    }

    return compose;
  })();

  // Disable persisting state enhancer
  // const enhancer = composeEnhancers(applyMiddleware(...middlewares), persistState());
  const enhancer = composeEnhancers(applyMiddleware(...middlewares));

  const rootReducer = combineReducers(reducers);

  return createStore(rootReducer, initialState, enhancer);
}

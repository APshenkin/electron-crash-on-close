import { send } from 'redux-electron-ipc';
import windowActions from '../redux-modules/window';

const windowMiddleware = store => next => action => {
  switch (action.type) {
    case (windowActions.resizeWindow.toString()):
      store.dispatch(send('resizeWindow', action.payload.width, action.payload.height));

      break;

    default:
      return next(action);
  }
};

export default windowMiddleware;

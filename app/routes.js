import React from 'react';
import { Switch, Route } from 'react-router';

import CreateWallet from './containers/create-wallet';

export default (
  <Switch>
    <Route exact path='/' component={CreateWallet} />
  </Switch>
);

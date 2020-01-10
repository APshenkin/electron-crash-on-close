import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';

import CreateWallet from '../components/create-wallet';
import windowActions from '../redux-modules/window';
// import { walletsActions } from '../redux-modules/wallets';
import { dashboardSize } from '../constants';


class CreateWalletContainer extends Component {
  static propTypes = {
    window: PropTypes.object,
    wallets: PropTypes.object,
    settings: PropTypes.object,
    onWalletCreate: PropTypes.func
  };

  componentDidMount() {
    this.props.window.resizeWindow(dashboardSize);
  }

  createWallet = () => {
  };

  // onCreate = () => {
  //   this.props.wallets.getWallets({});
  //   this.props.onWalletCreate();
  // };


  render() {
    return (
      <div>
        {<CreateWallet isTest={this.props.settings.isTest} onComplete={this.createWallet}/>}
      </div>
    );
  }
}

const mapStateToProps = ({ settings }) => {
  return {
    settings
  };
};

const mapDispatchToProps = (dispatch) => {
  const window = bindActionCreators(windowActions, dispatch);
  // const wallets = bindActionCreators(walletsActions, dispatch);

  return {
    window,
    // wallets,
    onWalletCreate: () => {
      dispatch(push('/dashboard'));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(CreateWalletContainer);

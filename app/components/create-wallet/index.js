import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

import Button from '../button';
import PartkeyWindow from '../partkey-window';



export default class CreateWallet extends Component { // eslint-disable-line
  static propTypes = {
    onComplete: PropTypes.func.isRequired,
    isTest: PropTypes.bool,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  }

  state = {
    step: 5,
    wallet: {
      walletId: 'foo',
      distKeys: [
        { keyId: '1', value: 'foo' },
        { keyId: '2', value: 'foo' },
        { keyId: '3', value: 'foo' }
      ]
    },
    keys: {
      '1': { id: '1', value: 'foo' },
      '2': { id: '2', value: 'foo' },
      '3': { id: '3', value: 'foo' }
    },
    walletName: 'foo',
    genKeys: true,
  };

  componentDidMount() {
    document.addEventListener('keyup', this.handleEnterKey);
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.handleEnterKey);
  }

  handleEnterKey = (e) => {
    let key = e.which || e.keyCode;

    if (key === 13) {
      ReactDOM.findDOMNode(this.buttonNext).click();
    }
  }

  encryptKey = (key) => {
    this.setState({
      keyToEncrypt: key
    });
  }

  saveKeyState = (key, holder, isSaved) => {
    const keys = !isSaved ? this.state.keys : {
      ...this.state.keys,
      [key.keyId]: {
        ...this.state.keys[key.keyId],
        holder,
      }
    };

    this.setState({
      keyToEncrypt: null,
      keys
    });
  }

  renderManageKeys() {
    return (
      <div style={{'margin-top': '40px'}}>
        <div>
          <div>
            {this.state.wallet.distKeys.map((key, ix) => (
              <div
                key={key.keyId}
                onClick={this.state.keys[key.keyId].holder ? this.encryptKey.bind(this, key) : null}
              >
                <div>
                </div>
                {
                  !this.state.keys[key.keyId].holder &&
                  <Button
                    onClick={this.encryptKey.bind(this, key)}
                    filled
                    children={`Save and encrypt key ${ix + 1}`}
                    size={'s'}
                  />
                }
                {
                  this.state.keys[key.keyId].holder &&
                  <div>
                    <span >
                      {`Key holder ${ix + 1}`}
                    </span>
                    <div>{this.state.keys[key.keyId].holder}</div>
                  </div>
                }
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  render() {
    return (
      <div>
        {
          this.state.step === 5 && this.renderManageKeys()
        }
        {
          this.state.keyToEncrypt &&
          <PartkeyWindow
            keyIndex={this.state.wallet.distKeys.indexOf(this.state.keyToEncrypt) + 1}
            partkey={this.state.keyToEncrypt}
            currency={this.state.currency}
            extendedPublicKey={this.state.wallet.exPublicKey}
            walletId={this.state.wallet.walletId}
            walletName={this.state.walletName}
            walletAddress={this.state.address}
            onClose={this.saveKeyState}
          />
        }
      </div>
    );
  }
}

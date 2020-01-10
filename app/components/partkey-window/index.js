import React, { PureComponent } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { remote, ipcRenderer } from 'electron';

import Button from '../button';
import { copyStyles } from '../../lib/window-utils';
import { encrypt } from '../../lib/crypto';
import cuid from "cuid";


export default class PartkeyWindow extends PureComponent {
  static propTypes = {
    keyIndex: PropTypes.number,
    partkey: PropTypes.object,
    onClose: PropTypes.func,
    walletId: PropTypes.string,
    walletName: PropTypes.string,
    currency: PropTypes.string,
    extendedPublicKey: PropTypes.string,
    walletAddress:PropTypes.string,
  };

  state = {
    holder: cuid(),
    pass: '1',
    inputType: 'password',
    step: 2,
  };

  componentWillMount() {
    this.nativeWindowObject = window.open('', 'partkey');

    setTimeout(() => copyStyles(document, this.nativeWindowObject.document), 0);

    this.nativeWindowObject.addEventListener('beforeunload', () => {
      this.nativeWindowObject.document.removeEventListener('keyup', this.handleEnterKey);
      this.props.onClose && this.props.onClose(this.props.partkey, this.state.holder, this.state.fileSaved);
    }, false);

    this.nativeWindowObject.document.addEventListener('keyup', this.handleEnterKey);

    if (remote.process.platform === 'darwin') {
      this.nativeWindowObject.document.body.classList.add('isMac');
    }

    // eslint-disable-next-line
    this.nativeWindowObject.eval = global.eval = function() {
      throw new Error('does not support window.eval() for security reasons.');
    };
  }

  nativeWindowObject = null;

  handleEnterKey = (e) => {
    let key = e.which || e.keyCode;

    if (key === 13) {
      ReactDOM.findDOMNode(this.buttonNext).click();
    }
  }

  changeVisibility = () => {
    this.setState({
      inputType: this.state.inputType === 'text' ? 'password' : 'text'
    });
  }

  setField = (e) => {
    const { name, value } = e.target;

    this.setState({
      [name]: value,
    });
  }

  goToStep = (step) => {
    this.setState({
      step
    });
  }

  saveKey = () => {
    let data = encrypt(JSON.stringify(this.generateKey()), this.state.pass);

    let key = {
      type: 'key',
      value: data,
    };

    let filename = remote.dialog.showSaveDialogSync({
      defaultPath: `${this.props.walletName.toUpperCase()}_${this.state.holder.toUpperCase()}_KEY.test`,
      showsTagField: false,
      filters: [{ name: 'test', extensions: ['test'] }]
    });

    if (filename) {
      ipcRenderer.on('fileSaved', () => {
        this.setState({
          fileSaved: true,
        }, () => {
          this.nativeWindowObject.close();
        });
      });

      ipcRenderer.send('saveFile', filename, JSON.stringify(key));
    }
  }

  generateKey = () => {
    return {
      walletId: this.props.walletId,
      currency: this.props.currency,
      name: this.props.walletName,
      address: this.props.walletAddress,
      keys: [{
        keyId: this.props.partkey.keyId,
        name: this.state.holder,
        value: this.props.partkey.value
      }],
      extendedPublicKey: this.props.extendedPublicKey,
    };
  }

  renderPassConfirmation = () => {
    this.setState({
      passwordConfirmation: true
    });
  }

  cancelPassConfirmation = () => {
    this.setState({
      passwordConfirmation: false
    });
  }

  verifyPass = () => {
    if (this.state.verifiedPass !== this.state.pass) {
      this.setState({
        passVerificationError: true,
      });
    } else {
      this.setState({
        passwordConfirmation: false,
        step: 2,
      });
    }
  }

  renderKeyForm = () => {
    return (
      <div id='app'>
        <div style={{ 'margin-top': '40px' }}>
          <div id='drag-area'/>
          <div>
            <div>
              <span onClick={this.goToStep.bind(this, 1)}>Back</span>
              <Button
                ref={(node) => {this.buttonNext = node;}}
                onClick={this.saveKey}
                filled
                children='Save key'
                size={'s'}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    return this.nativeWindowObject ? ReactDOM.createPortal(this.renderKeyForm(), this.nativeWindowObject.document.body) : null;
  }
}

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';

class Button extends PureComponent {
  static propTypes = {
    className: PropTypes.string,
    onClick: PropTypes.func,
    filled: PropTypes.bool,
    fullwidth: PropTypes.bool,
    disabled: PropTypes.bool,
    disabledReason: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    size: PropTypes.string,
  }

  constructor() {
    super();
  }

  render() {
    const {
      children,
      onClick,
      disabled,
      disabledReason,
      ...props
    } = this.props;

    return (
      <button onClick={onClick} disabled={disabled} {...props}>
        {children}
        {
          Boolean(disabled && disabledReason) &&
            <span children={disabledReason} />
        }
      </button>
    );
  }
}

export default Button;

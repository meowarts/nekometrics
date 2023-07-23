import styled from 'styled-components';
import { NekoFonts, NekoColors } from '~/theme';
import PropTypes from 'prop-types';

// NEW NEKO BUTTON

const StyledButton = styled.a`
  display: flex;
  align-items: center;
  height: 36px;
  text-transform: uppercase;
  align-self: center;
  justify-content: center;
  font-family: ${NekoFonts.FAMILY.NOVA_FLAT};
  font-size: ${NekoFonts.SIZE[14]};
  letter-spacing: 0.03em;
  border-radius: 2px;
  color: white;
  padding: 0px 25px;
  border: 1px #FCFCFC solid;
  text-decoration: none;
  transition: all 150ms ease-in;

  svg {
    margin-left: -5px;
    margin-right: 10px;
  }

  &.primary {
    border-color: rgb(255 255 255 / 15%);
    background: rgb(255 255 255 / 5%);

    &:hover {
      border-color: rgb(255 255 255 / 20%);
      background: rgb(255 255 255 / 10%);
    }
  }

  &.secondary {
    border-color: ${NekoColors.WHITE};

    &:hover {
      color: #AB7BFF;
      border-color: #AB7BFF;
    }
  }

  &.tertiary {
    border-color: ${NekoColors.PURPLE};
    color: ${NekoColors.WHITE};
    background: ${NekoColors.PURPLE};

    &:hover {
      background: ${NekoColors.LIGHT_PURPLE};
    }
  }

  &.quarternary {
    color: ${NekoColors.PURPLE};

    &:hover {
      color: ${NekoColors.LIGHT_PURPLE};
    }
  }

  &.danger {
    border-color: rgb(255 0 0 / 15%);
    background: rgb(255 0 0 / 5%);

    &:hover {
      border-color: rgb(255 0 0 / 20%);
      background: rgb(255 0 0 / 10%);
    }
  }

  &.big {
    font-size: ${NekoFonts.SIZE[18]};
    padding: 25px 60px;
  }

  &.small {
    font-size: ${NekoFonts.SIZE[14]};
    height: 32px;
    padding: 0 20px;
  }

  &:hover {
    cursor: pointer;
    transition: all 150ms ease-out;
  }

  &.disabled {
    border: none;
    cursor: default;
    opacity: 0.4;

    &:hover {
      border: none;
      cursor: not-allowed;
    }
  }
`;

const NekoButton = (props) => {
  let { children, text, primary, secondary, tertiary, quarternary, danger, big, small, disabled, ...rest } = props;
  const className = `${primary ? 'primary' : ''} ${secondary ? 'secondary' : ''} ${tertiary ? 'tertiary' : ''}
    ${quarternary ? 'quarternary' : ''} ${danger ? 'danger' : ''} ${big ? 'big' : ''} ${small ? 'small' : ''}
    ${disabled ? 'disabled' : ''}`;

  // Default values
  if (!children && text) { children = text ?? "N/A" }
  if (!primary && !secondary && !danger) { primary = true }

  return (
    <StyledButton className={className} rel="noopener noreferrer" {...rest}>
      {children}
    </StyledButton>
  )
}

NekoButton.propTypes = {
  children: PropTypes.any, 
  text: PropTypes.any,
  primary: PropTypes.any,
  secondary: PropTypes.any,
  big: PropTypes.any,
  small: PropTypes.any,
  danger: PropTypes.any,
  onClick: PropTypes.func
};

export default NekoButton;
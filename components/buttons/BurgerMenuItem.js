const { MenuItem, ListItemIcon, Typography } = require("@material-ui/core");
const { forwardRef } = require("react");
import { NekoColors } from '~/theme';

import PropTypes from 'prop-types';

const avoidEventPropagation = (ev) => { ev.stopPropagation() };

// TODO: We should probably rename this component.
// It's used as a menu item everywhere through Nekometrics

// eslint-disable-next-line react/display-name
const BurgerMenuItem = forwardRef((props, ref) => {
  const { onClick, label = '', icon, ...rest } = props;
  return (
    <MenuItem onClick={onClick} onMouseDown={avoidEventPropagation} innerRef={ref} {...rest}>
      <ListItemIcon style={{ minWidth: 40, color: NekoColors.PURPLE }}>{icon}</ListItemIcon>
      <Typography>{label}</Typography>
    </MenuItem>
  );
});

BurgerMenuItem.propTypes = {
  label: PropTypes.string,
  icon: PropTypes.object,
  onClick: PropTypes.func
};

export { BurgerMenuItem };
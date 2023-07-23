import { useState } from 'react';

import { Menu, IconButton } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteIcon from '@material-ui/icons/Delete';
import RefreshIcon from '@material-ui/icons/Refresh';
import CompareArrowsIcon from '@material-ui/icons/CompareArrows';
import PropTypes from 'prop-types';

import useGlobalState from '~/libs/context';
import MoveWidgetModal from '../modals/MoveWidgetModal';
import { BurgerMenuItem } from '../buttons/BurgerMenuItem';

const avoidEventPropagation = (ev) => { ev.stopPropagation() };

const WidgetBurgerIcon = (props) => {
  const css = useStyles();
  const { healthySpine, widget, onRefreshMetrics, onOpenSettings, disabled = false } = props;
  const [ menuAnchorEl, setMenuAnchorEl ] = useState(null);
  const [ dialog, setDialog ] = useState(false);
  const { deleteWidget } = useGlobalState(); 
  const settingsClick = (ev) => { setMenuAnchorEl(ev.currentTarget) };
  const menuSettingsClose = () => { setMenuAnchorEl(null) };

  const menuDelete = () => {
    if (confirm("Are you sure you would like to delete this widget?")) {
      deleteWidget(widget._id);
    }
    setMenuAnchorEl(null);
  }

  let iconTitle = (!widget.enabled && widget.lastIssue) ? 
    widget.lastIssue.error.replace('FriendlyError: ', '') : 'Settings';

  return (
    <>

      <IconButton className={css.miniIcon} color={widget.enabled ? 'default' : 'secondary'} size="small" 
        disabled={disabled} onMouseDown={avoidEventPropagation} onClick={settingsClick} title={iconTitle}>
        <MoreVertIcon fontSize="inherit" />
      </IconButton>

      <Menu anchorEl={menuAnchorEl} keepMounted open={Boolean(menuAnchorEl)} onClose={menuSettingsClose} className={css.burgerIcons}>

        <BurgerMenuItem label="Refresh" icon={<RefreshIcon />}
          onClick={() => menuSettingsClose() || onRefreshMetrics()} />

        {healthySpine && <BurgerMenuItem label="Settings" icon={<SettingsIcon />} 
          onClick={() => menuSettingsClose() || onOpenSettings()} />}

        <BurgerMenuItem label="Move" icon={<CompareArrowsIcon />}
          onClick={() => menuSettingsClose() || setDialog('move')} />

        <BurgerMenuItem label="Trash" icon={<DeleteIcon />} 
          onClick={menuDelete} />

      </Menu>

      <MoveWidgetModal widgetId={widget._id} fullWidth={true} open={dialog === 'move'} onClose={() => setDialog()} 
        onMouseDown={(ev) => ev.stopPropagation()} />

    </>
  );
}

const useStyles = makeStyles(theme => ({
  miniIcon: {
    margin: -8,
    color: theme.common.COLOR_PRIMARY_NEKO
  },
  burgerIcons: {
    '& .MuiListItemIcon-root': {
      color: theme.colors.PURPLE
    }
  }
}));

WidgetBurgerIcon.propTypes = {
  widget: PropTypes.object,
  healthySpine: PropTypes.bool,
  onOpenSettings: PropTypes.func,
  onRefreshMetrics: PropTypes.func,
  disabled: PropTypes.bool
};

export default WidgetBurgerIcon;

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { makeStyles } from '@material-ui/core/styles';

import { Popover, Typography, List, ListItem, ListItemText, 
    ListItemSecondaryAction, Badge, Divider, IconButton, ListItemAvatar } from '@material-ui/core';
import { KeyboardArrowDown } from '@material-ui/icons';
import EditIcon from '@material-ui/icons/Edit';
import AddIcon from '@material-ui/icons/Add';
import WidgetsIcon from '@material-ui/icons/Widgets';

import useGlobalState from '~/libs/context';
import CreateDashboardModal from '../modals/CreateDashboardModal';
import ModifyDashboardModal from '../modals/ModifyDashboardModal';
import NekoButton from '~/components/buttons/NekoButton';

const DashboardSelect = function () {
  const { dashboard, dashboards, changeDashboard, toggleModal, modals } = useGlobalState();
  const [ modal, setModal ] = useState();
  const css = useStyles();

  const [ anchorDashboardEl, setAnchorDashboardsEl ] = useState(null);
  const showDashboards = Boolean(anchorDashboardEl);
  const onDashboardsClick = ev => { setAnchorDashboardsEl(ev.currentTarget) };
  const onDashboardsClose = () => { setAnchorDashboardsEl(null) };

  const dashboardSwitch = useMemo(() => (
    <>
      <div className = {css.dashboardSelect} onClick={onDashboardsClick}>
        <Typography className="text" style={{ fontSize: '18px' }}>
          {dashboard ? dashboard.name : '-'}
        </Typography>
        <KeyboardArrowDown style={{ margin: '2px 0px 0px 5px' }}/>
      </div>
      <Popover id='dashboard-select-popover' style={{ marginTop: 10 }}
        open={showDashboards} anchorEl={anchorDashboardEl} onClose={onDashboardsClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <List dense={false} style={{ marginTop: -8 }}>
          {dashboards.map(x => 
            <Link key={`dashboard-select-${x._id}`} href={`/db/${x._id}`} passHref>
              <ListItem button disabled={x._id === dashboard._id} onClick={() => { onDashboardsClose(); changeDashboard(x._id); }}>
                <ListItemAvatar className={css.listItemAvatar}>
                  <Badge badgeContent={x.widgets.length}>
                    <WidgetsIcon />
                  </Badge>
                </ListItemAvatar>
                <ListItemText><Typography>{x.name}</Typography></ListItemText>
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={() => { setAnchorDashboardsEl(); setModal(x); }}>
                    <EditIcon fontSize="inherit" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </Link>
          )}
          <Divider />
          <div style={{ display: 'flex', padding: '10px 18px', marginBottom: -5 }}>
            <NekoButton tertiary startIcon={<AddIcon />} style={{ flex: 'auto' }}
              onClick={() => { setAnchorDashboardsEl(); toggleModal('createdashboard'); }}>
              <AddIcon /> Create Dashboard
            </NekoButton>
          </div>
        </List>
      </Popover>
      <CreateDashboardModal open={modals.createdashboard} onClose={() => {toggleModal('createdashboard'); console.log(modals.createdashboard)}} />
      <ModifyDashboardModal open={!!modal && modal !== 'createDashboard'} dashboard={modal} onClose={() => setModal()} />
    </>
  ), [anchorDashboardEl, modal, modals, dashboard, dashboards]);

  return dashboardSwitch;
}

const useStyles = makeStyles(theme => ({
    dashboardSelect: {
      color: theme.common.COLOR_SECONDARY_NEKO,
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      cursor: 'pointer'
    },
    listItemAvatar: {
      minWidth: '40px',
      color: theme.colors.PURPLE
    }
}));

export default DashboardSelect;
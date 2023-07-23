import { useState } from 'react';
import Router, { withRouter } from 'next/router';

import { Divider, IconButton, List, ListItemText, Popover } from '@material-ui/core';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import SettingsIcon from '@material-ui/icons/Settings';

import useGlobalState from '~/libs/context';
import NekoButton from './NekoButton';
import { BurgerMenuItem } from './BurgerMenuItem';

import { signOut } from '~/libs/requests';

const ProfileButton = function () {
  const { busy, user, toggleModal, disconnectUser } = useGlobalState();
  const [ anchorMenuEl, setAnchorMenuEl ] = useState(null);
  const showMenu = Boolean(anchorMenuEl);
  
  const onMenuClose = () => { setAnchorMenuEl(null) };

  const onIconClick = ev => { 
    if (!user) {
      toggleModal('login');
      return;
    }
    setAnchorMenuEl(ev.currentTarget);
  };

  const onSettingsClick = () => {
    setAnchorMenuEl();
    toggleModal('account');
  }

  const onLogout = async () => {

    // We don't want this to slow down the rest
    (async () => {
      let res = await signOut();
      if (!res.success) {
        alert("Small error during logout")
      }
    })();

    // Clean the UI
    disconnectUser();
    setAnchorMenuEl();
    Router.push('/');
    return;
  };

  return (<>
    {user && <>
      <IconButton style={{ marginLeft: 0, marginRight: -10 }} edge="start" color="inherit" onClick={onIconClick}>
        <PersonIcon />
      </IconButton>

      <Popover id='dashboard-select-popover' style={{ marginTop: 10 }}
        open={showMenu} anchorEl={anchorMenuEl} onClose={onMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <List dense={false} style={{ margin: '5px 15px 5px 15px' }}>
          <ListItemText style={{ textAlign: 'left', marginBottom: 10 }}>
            Signed in as {user.firstName ? user.firstName : user.email}
          </ListItemText>
          <Divider />
          <BurgerMenuItem style={{ marginTop: 5, paddingLeft: 0 }} label="Settings" icon={<SettingsIcon />} 
            onClick={onSettingsClick} />
          <BurgerMenuItem style={{ paddingLeft: 0 }} label="Sign Out" disabled={busy} icon={<ExitToAppIcon />} 
            onClick={onLogout} />  
        </List>
      </Popover>
    </>}

    {!user && 
      <span onClick={onIconClick}>
        <NekoButton small secondary text={<span>Login <small>or</small> Register</span>} />
      </span>
    }
  </>);
}

export default withRouter(ProfileButton);
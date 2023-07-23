import Link from 'next/link';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';

import { Drawer } from '@material-ui/core';
import { List, ListItem, ListItemText, ListSubheader } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import useGlobalState from '../libs/context';

const NekoDrawer = (props) => {

  const isDashboard = props.router.route === '/dashboard';
  const { showDrawer, toggleDrawer, dashboards, dashboard, changeDashboard, toggleModal } = useGlobalState(); 

  const onServiceClick = () => { toggleModal('datasources') };
  const onAccountClick = () => { toggleModal('account') };

  const StyledListSubHeader = withStyles(theme => ({
    root: { color: theme.common.COLOR_SECONDARY_NEKO }
  }))(ListSubheader)

  const StyledListItem = withStyles(() => ({
    root: {
      paddingTop: 0, 
      paddingBottom: 0
    }
  }))(ListItem)

  return (
    <>
      <Drawer open={showDrawer} onClose={toggleDrawer}>
        <div style={{ width: '240px', display: 'flex', flexDirection: 'column', height: '100%' }} onClick={toggleDrawer}>
          <div style={{ flex: 'auto', paddingTop: '50px' }}>
            <List subheader={ <StyledListSubHeader> NAVIGATION </StyledListSubHeader> } >
              <Link href="/" passHref>
                <StyledListItem button component="a" key="Home">
                  <ListItemText primary="Home" />
                </StyledListItem>
              </Link>
              <Link href="/faq" passHref>
                <StyledListItem button component="a" key="FAQ">
                  <ListItemText primary="FAQ" />
                </StyledListItem>
              </Link>   
              <Link href="/contact" passHref>
                <StyledListItem button component="a" key="Contact">
                  <ListItemText primary="Contact" />
                </StyledListItem>
              </Link>           
            </List>
            <List subheader={ <StyledListSubHeader> ACCOUNT </StyledListSubHeader> } >
              <StyledListItem button component="a" key="Account" onClick={onAccountClick}>
                <ListItemText primary="Settings" />
              </StyledListItem>
              <StyledListItem button component="a" key="DataSources" onClick={onServiceClick}>
                <ListItemText primary="Data Sources" />
              </StyledListItem>
            </List>
            <List subheader={ <StyledListSubHeader> DASHBOARDS </StyledListSubHeader> } >
            {dashboards.map(x =>
              <Link key={`drawer-dashboard-select-${x._id}`} href={`/db/${x._id}`} passHref>
                <StyledListItem button disabled={isDashboard && x._id === dashboard._id} onClick={() => changeDashboard(x._id)}>
                  <ListItemText primary={x.name} />
                </StyledListItem>
              </Link>
            )}
          </List>
          </div>
        </div>
			</Drawer>
      <style jsx>{`
      `}</style>
    </>
  );
};

NekoDrawer.propTypes = {
  router: PropTypes.any
};

export default withRouter(NekoDrawer);
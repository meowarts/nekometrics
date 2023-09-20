import Link from 'next/link';
import { withRouter } from 'next/router';
import PropTypes from 'prop-types';

import { Menu as MenuIcon } from '@material-ui/icons';
import { AppBar, Typography, Toolbar, IconButton, Hidden } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import useGlobalState from '~/libs/context';
import AccountButton from './buttons/ProfileButton';
import DashboardSelect from './buttons/DashboardSelect';
import NekoButton from './buttons/NekoButton';

const Header = (props) => {
  const css = useStyles();
  const { toggleDrawer, user } = useGlobalState();
  const isDashboard = user && props.router.route === '/dashboard';

  return (
    <AppBar position="static" color='primary' className={css.appBar}>
      <Toolbar>
        <div className={css.leftSide}>
          {user && 
            <IconButton edge="start" color="inherit" onClick={toggleDrawer} className={css.burger}>
              <MenuIcon />
            </IconButton>
          }
          <Link href="/">
            <div className={css.logoContainer}>
              <Typography className={css.title}>NEKOMETRICS</Typography>
            </div>
          </Link>
          {!isDashboard &&
            <div className={css.navLinks}>
              <Link href='/faq'>FAQ</Link>
              <Link href='https://github.com/meowarts/nekometrics' target='_blank'>GITHUB</Link>
              <Link href='/demo'>DEMO</Link>
              <Link href='/contact'>CONTACT</Link>
              {(user && user.accountType === 'admin') && <Link href='/admin'>ADMIN</Link>}
            </div>
          }
        </div>
        <Hidden only={['xs', 'sm']}>
          <div className={css.center}>
            {isDashboard && <DashboardSelect />}
          </div>
        </Hidden>

          <div className={css.rightSide}>
            {!isDashboard && user && <Link href="/dashboard" passHref> 
              <NekoButton secondary text="Dashboard" />
            </Link> }
            {props.children}
            <AccountButton />
          </div>
      </Toolbar>
    </AppBar>
  );
};

const useStyles = makeStyles(theme => ({
  appBar: {
    flexGrow: 1,
    background: theme.common.HEADER_FOOTER_BACKGROUND,
    boxShadow: 'none',
    display: 'flex',
    position: 'fixed',
    paddingRight: 10
  },
  leftSide: {
    display: 'flex',
    flex: 1
  },
  center: {
    flex: 1
  },
  rightSide: {
    flex: 1,
    textAlign: 'right',
    display: 'flex',
    justifyContent: 'flex-end'
  },
  logo: {
    height: 44
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    '& a': {
      marginRight: 10,
      color: 'white',
      textDecoration: 'none',
      fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
      fontSize: theme.fonts.SIZE[14],
    },
    '& a:hover': {
      color: theme.common.COLOR_SECONDARY_NEKO
    },
    [theme.breakpoints.down(900)]: { display: 'none' }
  },
  logoContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    "&:hover, &:focus": {
      cursor: 'pointer'
    },
    margin: 10
  },
  title: {
    marginLeft: 5,
    marginRight: 10,
    fontSize: theme.fonts.SIZE[18],
    fontFamily: theme.fonts.FAMILY.CODA,
    letterSpacing: 1.2,
    fontWeight: theme.fonts.WEIGHT[600]
  }
}));

Header.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  router: PropTypes.any
};

export default withRouter(Header);
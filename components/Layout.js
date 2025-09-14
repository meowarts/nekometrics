import { useEffect } from 'react';
import PropTypes from 'prop-types';
import ReactGA from 'react-ga';
import getConfig from 'next/config';
import { withRouter } from 'next/router';

import CssBaseline from '@material-ui/core/CssBaseline';
import { makeStyles } from '@material-ui/core/styles';

import useGlobalState from '~/libs/context';
import Header from './Header';
import Drawer from './Drawer';
import DataSourceModal from './modals/DataSourceModal';
import AccountModal from './modals/AccountModal';
import { NekoColors, NekoFonts } from '~/theme';
import SignInModal from './modals/SignInModal';
import AddWidgetModal from './modals/AddWidgetModal';
import AddDataSourceModal from './modals/AddDataSourceModal';

const { publicRuntimeConfig: CFG } = getConfig();

const Layout = props => {
  const styles = useStyles();
  const { dashboard } = useGlobalState();
  const isDashboard = props.router.route === '/dashboard';
  const backImageSrc = dashboard?.settings?.backImageSrc?.replace("-thumbnail", "") || null;
  const dashboardBackground = backImageSrc ? styles.pictureBackground : styles.solidBackground;

  useEffect(() => {
    // Maybe we should initialize only once, let's see how we can do this properly
		ReactGA.initialize(CFG.analytics, { debug: false });
		ReactGA.pageview(window.location.pathname);
	}, []);

  return (
    <>
      <CssBaseline />
      <Header className={styles.header}>{props.headerMenu}</Header>
      <Drawer />
      <div className={isDashboard ? dashboardBackground : styles.solidBackground } 
        style={{ backgroundImage: `url(${ backImageSrc ?? '/main-wallpaper.svg' })`}}>
      </div>
      <div className={styles.pageContainer}>
        <div className={styles.paperPage}>
          {props.children}
        </div>
      </div>

      <AccountModal />
      <SignInModal />
      <AddWidgetModal />
      <DataSourceModal />
      <AddDataSourceModal />

      <style global jsx>{`
        #__next, body, html { height: 100%; }

        .MuiButtonBase-root {
          box-shadow: none !important;
        }

        .MuiButton-containedPrimary {
          background-color: ${NekoColors.PURPLE} !important;
        }

        .MuiButton-containedPrimary:hover {
          background-color: #8b72da !important;
        }

        .MuiDialog-paperWidthSm {
          min-width: 600px;
        }

        // Dashboard Dialog Titles
        h5 {
          font-family: ${NekoFonts.FAMILY.CODA};
          font-size: ${NekoFonts.SIZE[20]};
          margin: 0;
          padding: 30px 24px 0px;
          color: ${NekoColors.PURPLE};
          letter-spacing: 2px;
        },

      `}</style>
    </>
  );
};

const useStyles = makeStyles(theme => ({
  header: { flexShrink: 0 }, //Prevent shrinking smaller than their content's default minimum size.
  pageContainer: {
    flex: '1 0 auto',
    display: 'flex',
    justifyContent: 'center',
    padding: '70px 0px 0px',
    minHeight: '100vh',
    [theme.breakpoints.down(900)]: { padding: '0 10px' }
  },
  paperPage: {
    width: '100%',
    position: 'relative',
    borderRadius: 0,
    maxWidth: 1042,
    background: 'none', 
    boxShadow: 'none',
    fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
    color: 'white',

    '& h1, & h2, & h3, & h5': {
      fontFamily: theme.fonts.FAMILY.NOVA_FLAT
    },

    '& h4, & p, & li, & i': {
      fontFamily: theme.fonts.FAMILY.CODA,
    },

    // Index In The Know Items
    '& li, & ul': {
      listStyleType: 'none',
      padding: 0
    },

    // Main Title
    '& h1': {
      letterSpacing: '-0.05em',
      fontSize: theme.fonts.SIZE[55],
      fontWeight: theme.fonts.WEIGHT[500],
      lineHeight: 1.167,
      margin: 0,
      [theme.breakpoints.down(900)]: { fontSize: theme.fonts.SIZE[32] }
    },

    // Index Section Titles
    '& h2': {
      fontSize: theme.fonts.SIZE[40],
      fontWeight: theme.fonts.WEIGHT[400],
      margin: 0,
      lineHeight: '45px'
    },

    '& a': {
      color: theme.common.COLOR_PRIMARY_NEKO,
      textDecoration: 'none'
    },

    "& .react-resizable-handle::after": {
      borderRight: '2px solid rgb(255 255 255 / 40%)',
      borderBottom: '2px solid rgb(255 255 255 / 40%)'
    }
  },
  page: {
    position: 'relative',
    borderRadius: 0,
    padding: 0,
    minHeight: 600, 
    background: 'transparent',
    maxWidth: 1042, 
    boxShadow: 'none'
  },
  pictureBackground: {
    background: 'url(/photo-full-of-stars.jpeg)',
    position: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    overflow: 'visible',
    zIndex: -1
  },
  solidBackground: {
    background: 'url(/main-wallpaper.svg) !important',
    position: 'fixed',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    overflow: 'visible',
    zIndex: -1,

    [theme.breakpoints.down(900)]: { background: theme.common.PAGE_BACKGROUND },
  }
}));

Layout.propTypes = {
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired,
  headerMenu: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]),
  router: PropTypes.any
};

export default withRouter(Layout);
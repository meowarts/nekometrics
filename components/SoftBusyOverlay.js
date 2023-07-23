import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import CircularProgress from '@material-ui/core/CircularProgress';
import { makeStyles } from '@material-ui/core/styles';

const SoftBusyOverlay = (props) => {
  const { busy } = props;
  const [ showLoader, setShowLoader ] = useState(true);
  const css = useStyles();

  useEffect(() => {
    if (!busy) { 
      const timeout = setTimeout(() => { setShowLoader(false) }, 1000);
      return () => { clearTimeout(timeout); };
    }
    setShowLoader(true);
  }, [busy]);

  const loader = !showLoader ? null : (
    <div className={css.overlay + ' ' + (!busy ? css.overlayHidden : '')}>
      <CircularProgress className={css.spinner + ' ' + (!busy ? css.spinnerHidden : '')} />
    </div>
  );

  // I am removing the busy because I like it as a boolean...
  // ... but React doesn't like pure boolean value here.
  const propsForElement = { ...props, busy: undefined };
  return (
    <div style={{ position: 'relative' }} {...propsForElement}> 
      {loader}
      {props.children}
    </div>
  );
};

const useStyles = makeStyles(() => ({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(55, 64, 98, 0.9);',
    transition: 'opacity 1s ease-out',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center'
  },
  overlayHidden: {
    opacity: 0,
  },
  spinner: {
    color: 'rgba(0, 0, 0, 0.32)',
    transition: 'opacity 0.5s ease-out'
  },
  spinnerHidden: {
    opacity: 0,
  }
}));

SoftBusyOverlay.propTypes = {
  busy: PropTypes.bool.isRequired,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node
  ]).isRequired
};

export default SoftBusyOverlay;
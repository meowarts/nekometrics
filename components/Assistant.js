import { Paper, Stepper, StepLabel, Step, Typography } from '@material-ui/core';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import { makeStyles } from '@material-ui/core/styles';
import useGlobalState from '../libs/context';

const Header = () => {
  const css = useStyles();
  const { dashboard, services, user, toggleModal } = useGlobalState();
  const hasServices = Boolean(services.length > 0);
  const hasWidgets = Boolean(dashboard && dashboard.widgets && dashboard.widgets.length > 0);
  const hasLinkedWidgets = Boolean(hasWidgets &&
    dashboard.widgets.find(x => x.settings && (x.service === 'fake' || x.settings.serviceId)));

  if (!user || hasLinkedWidgets) {
    return null;
  }

  return (
    <Paper variant="outlined" className={css.assistant}>
      <Stepper alternativeLabel>

        <Step active={(!hasServices)}>
          <StepLabel>
            <img title='Link Services' src='/link-services.png'
              srcSet={['/link-services.png 1x', '/link-services@2x.png 2x']}
              style={{ maxWidth: 300, width: '100%', filter: !hasServices ? 'none' : 'grayscale(1) brightness(1.3)' }}
            />
            <Typography variant="h3">Link your services</Typography>
            <span>Click <span className="add">+ ADD</span> and <b style={{ cursor: 'pointer' }} onClick={() => toggleModal('datasources')}>Data Source</b>.<br />Link Nekometrics to some of your external accounts such as Google, Facebook, etc. </span>
          </StepLabel>
        </Step>

        <Step active={(hasServices && !hasWidgets)}>
          <StepLabel>
            <img title='ADD Widget' src='/add-widget.png'
              srcSet={['/add-widget.png 1x', '/add-widget@2x.png 2x']}
              style={{ maxWidth: 300, width: '100%', filter: (hasServices && !hasWidgets) ? 'none' : 'grayscale(1) brightness(1.3)' }}
            />
            <Typography variant="h3">Add a widget</Typography>
            <span>Click <span className="add">+ ADD</span> and <b style={{ cursor: 'pointer' }} onClick={() => toggleModal('addwidget')}>Widget</b>.<br />Pick you first widget for this dashboard.</span>
          </StepLabel>
        </Step>

        <Step active={(hasServices && hasWidgets && !hasLinkedWidgets)}>
          <StepLabel>
            <img title='Setup Widget' src='/setup-widget.png'
              srcSet={['/setup-widget.png 1x', '/setup-widget@2x.png 2x']}
              style={{ maxWidth: 300, width: '100%', filter: (hasServices && hasWidgets && !hasLinkedWidgets) ? 'none' : 'grayscale(1) brightness(1.3)' }}
            />
            <Typography variant="h3">Set up your widget</Typography>
            <span>Click the little icon (<MoreVertIcon className={css.stepIcon} />) at the top-right of it. Attach your widget to a data source.</span>
          </StepLabel>
        </Step>

      </Stepper>
    </Paper>
  );
};

const useStyles = makeStyles(theme => ({

  assistant: {
    margin: '10px 10px 0px 10px',
    border: 'none',
    backgroundColor: 'transparent',

    '& span': {
      fontFamily: theme.fonts.FAMILY.CODA,
      fontSize: theme.fonts.SIZE[14],
      color: theme.common.COLOR_PRIMARY_NEKO,
      lineHeight: '24px'
    },

    '& h3': {
      fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
      fontSize: theme.fonts.SIZE[25],
      color: theme.common.COLOR_PRIMARY_NEKO,
      marginBottom: 10
    },

    '& .add': {
      fontFamily: theme.fonts.FAMILY.NOVA_FLAT,
      margin: '0px 3px',
      fontSize: '11px',
      fontWeight: 'bold',
      padding: '3px 8px 4px 8px',
      border: '1px solid white'
    },

    '& .MuiPaper-root': {
      backgroundColor: 'transparent'
    },

    '& .MuiStepIcon-root': {
      color: theme.common.COLOR_PRIMARY_NEKO
    },

    '& .MuiStepIcon-root.MuiStepIcon-active': {
      color: theme.colors.PURPLE
    },

    '& .MuiStepIcon-text': {
      fill: theme.common.COLOR_TERTIARY_NEKO
    }
  },

  stepIcon: {
    fontSize: theme.fonts.SIZE[14],
    position: 'relative',
    top: 3,
    padding: 1,
  }
}));

export default Header;
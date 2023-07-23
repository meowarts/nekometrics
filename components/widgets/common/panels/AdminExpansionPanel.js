import { useState } from 'react';
import { makeStyles } from "@material-ui/core";
import PropTypes from 'prop-types';
import DayJS from 'dayjs';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';
import useGlobalState from '~/libs/context';
import { forceGetMetrics } from '~/libs/requests';
import NekoButton from '~/components/buttons/NekoButton';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

const AdminAccordion = (props) => {

  // Props
  const { widget, expanded, onExpandPanel } = props;
  const [ isBusy, setIsBusy ] = useState();
  const { refreshWidget } = useGlobalState();

  // System
  const css = useStyles();
  const { user } = useGlobalState(); 
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  if (user?.accountType !== 'admin') {
    return (<></>);
  }

  // TODO: This should be moved to the context, probably.
  const onForceRefresh = async () => {
    setIsBusy(true);
    console.log('Call forceGetMetrics.');
    const res = await forceGetMetrics(widget._id);
    console.log('forceGetMetrics', res);
    if (res.success) {
      console.log('Call updateWidget', res);
      await refreshWidget(widget._id);
    }
    else {
      alert(res.message);
      console.log(res);
    }
    setIsBusy(false);
  }

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Admin</Typography>
        <div className={css.secondaryHeading}>
          {widget._id}
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className={css.accordionDetails}>
          <div>Widget ID: {widget._id}</div>
          <div>Service: {widget.service}</div>
          <div>Type: {widget.type}</div>
          <div>Enabled: {widget.enabled ? 'true' : 'false'}</div>
          <div>Refresh Daily: {widget.refreshDaily ? 'true' : 'false'}</div>
          <div>Refreshed On: {widget.refreshedOn ? DayJS(widget.refreshedOn).format('YYYY-MM-DD (HH:mm:ss)') : 'N/A'}</div>
          <div>Last Issue: {widget.lastIssue && 
            <>
              <span>{DayJS(widget.lastIssue.date).format('YYYY-MM-DD (HH:mm:ss)')}: </span><span>{widget.lastIssue.error}</span>
            </>}
          </div>
          <NekoButton tertiary style={{ marginTop: 10 }} onClick={() => onForceRefresh()} disabled={isBusy}>
            Force Refresh
          </NekoButton>

        </div>
      </AccordionDetails>
    </Accordion>
  );
};

AdminAccordion.propTypes = {
  widget: PropTypes.object,
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
};

export default AdminAccordion;

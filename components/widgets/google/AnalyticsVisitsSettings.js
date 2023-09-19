import { useState, useMemo, useEffect } from 'react';
import { makeStyles, DialogContent, DialogActions } from "@material-ui/core";
import { TextField, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

import ServiceAccordion from '../common/panels/ServiceExpansionPanel';
import PeriodAccordion from '../common/panels/PeriodExpansionPanel';
import ColorAccordion from '../common/panels/ColorExpansionPanel';

import useGlobalState from '~/libs/context';
import { NekoWidgetSettingsStyles } from '~/theme';
import AdminAccordion from '../common/panels/AdminExpansionPanel';
import ChartExpansionPanel from '../common/panels/ChartExpansionPanel';
import NekoButton from '~/components/buttons/NekoButton';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

const AnalyticsVisitsSettings = (props) => {

  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [propertyId, setDataStreamId] = useState(settings.propertyId ? settings.propertyId : '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'bar' });
  
  // System
  const css = useStyles();
  const { services } = useGlobalState(); 
  const service = services.find(x => x._id === serviceId);
  const expandPanel = (panel) => { setExpanded(panel) };
  const [expanded, setExpanded] = useState(false);
  const webProfiles = useMemo(() => {
    let webProfiles = [];
    if (service && service.data && service.data.accounts) {
      for (let account of service.data.accounts) {
        for (let property of account.properties) {
          for (let dataStream of property.dataStreams) {
            const { name } = dataStream;
            webProfiles.push({ propertyId: property.propertyId, name: property.name + ': ' + name });
          }
        }
      }
    }
    return webProfiles;
  }, [service]);

  // Save all Settings
  const onSave = () => {
    const newSettings = { serviceId, propertyId, color, period, chart };
    props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  // Set default name
  useEffect(() => {
    if (!name && propertyId) {
      const webProfile = webProfiles.find(x => x.propertyId === propertyId);
      if (webProfile) {
        setName(webProfile.name);
      }
    }
  }, [ propertyId ]);

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Google - Historical Users</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='google' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)} 
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
              <Select value={propertyId} onChange={(ev) => setDataStreamId(ev.target.value)}>
                {webProfiles.map((x) => 
                  <MenuItem className={css.googleWebProfileItem} key={x.propertyId} value={x.propertyId}>{x.name}</MenuItem>
                )}
              </Select>
              <FormHelperText>Select the website.</FormHelperText>
            </FormControl>
        </ServiceAccordion>

        <ColorAccordion expanded={expanded === 'colorPanel'} 
          title='Users'
          onExpandPanel={(ev, open) => expandPanel(open ? 'colorPanel' : false)} 
          color={color} onSetColor={setColor} />

        <PeriodAccordion expanded={expanded === 'periodPanel'} 
          onExpandPanel={(ev, open) => expandPanel(open ? 'periodPanel' : false)} 
          period={period} onSetPeriod={setPeriod} />

        <ChartExpansionPanel expanded={expanded === 'chartPanel'} 
          onExpandPanel={(ev, open) => expandPanel(open ? 'chartPanel' : false)} 
          chart={chart} onSetChart={setChart} />

        <AdminAccordion widget={widget} expanded={expanded === 'adminPanel'} 
          onExpandPanel={(_ev, open) => expandPanel(open ? 'adminPanel' : false)} />

      </DialogContent>

      <DialogActions style={{ margin: '5px 15px 10px 10px' }}>
        <NekoButton quarternary onClick={props.onClose} >Close</NekoButton>
        <NekoButton tertiary onClick={() => onSave()} >Save</NekoButton>
      </DialogActions>

    </>
  );
}

AnalyticsVisitsSettings.propTypes = {
  widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func
};

export default AnalyticsVisitsSettings;

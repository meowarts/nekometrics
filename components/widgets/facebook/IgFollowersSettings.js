import { useState, useEffect, useMemo } from 'react';
import { makeStyles, DialogContent, DialogActions } from "@material-ui/core";
import { TextField, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

import ServiceAccordion from '../common/panels/ServiceExpansionPanel';
import PeriodAccordion from '../common/panels/PeriodExpansionPanel';
import ColorAccordion from '../common/panels/ColorExpansionPanel';
import AdminAccordion from '../common/panels/AdminExpansionPanel';
import ChartExpansionPanel from '../common/panels/ChartExpansionPanel';

import useGlobalState from '~/libs/context';
import { NekoWidgetSettingsStyles } from '~/theme';
import NekoButton from '~/components/buttons/NekoButton';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

function IgFollowersSettings(props) {
  
  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [accountId, setAccountId] = useState(settings.accountId ? settings.accountId : '');
  const [igBusinessId, setIgBusinessId] = useState(settings.igBusinessId ? settings.igBusinessId : '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });
  
  // System
  const css = useStyles();
  const { services } = useGlobalState(); 
  const service = services.find(x => x._id === serviceId);
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  const igProfiles = useMemo(() => {
    let igProfiles = [];
    if (service && service.data && service.data.accounts) {
      for (let account of service.data.accounts) {
        if (account.instagram) {
          igProfiles.push({ accountId: account.id, igBusinessId: account.instagram.user_id, igInstagramName: account.instagram.user_name });
        }
      }
    }
    return igProfiles;
  }, [service]);

  const updateIgBusinessId = (newIgBusinessId) => {
    const profile = igProfiles.find(x => x.igBusinessId === newIgBusinessId);
    setIgBusinessId(profile.igBusinessId);
    setAccountId(profile.accountId);
  }

  // Save all Settings
  const onSave = () => {
    const newSettings = { serviceId, accountId, igBusinessId, color, period, chart };
    props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  // Set default name
  useEffect(() => {
    if (!name && igBusinessId) {
      const profile = igProfiles.find(x => x.igBusinessId === igBusinessId);
      setName(profile.igInstagramName);
    }
  }, [ igBusinessId ]);

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Instagram - Historical</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='facebook' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)} 
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={igBusinessId} onChange={(ev) => updateIgBusinessId(ev.target.value)}>
              {igProfiles.map((x) => <MenuItem key={x.igBusinessId} value={x.igBusinessId}>{x.igInstagramName}</MenuItem>)}
            </Select>
            <FormHelperText>Select the IG account.</FormHelperText>
          </FormControl>
        </ServiceAccordion>

        <ColorAccordion expanded={expanded === 'colorPanel'} 
          title='Followers'
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

IgFollowersSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func
};

export default IgFollowersSettings;

import { useEffect, useMemo, useState } from 'react';
import { makeStyles, DialogContent, DialogActions, h5 } from "@material-ui/core";
import { TextField, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
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

function PageLikesSettings(props) {
  
  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ?? '');
  const [serviceId, setServiceId] = useState(settings.serviceId ?? '');
  const [accountId, setAccountId] = useState(settings.accountId ?? '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });
  
  // System
  const css = useStyles();
  const { services } = useGlobalState(); 
  const service = services.find(x => x._id === serviceId);
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  const fbPages = useMemo(() => {
    let fbPages = [];
    if (service && service.data && service.data.accounts) {
      for (let account of service.data.accounts) {
        fbPages.push({ accountId: account.id, name: account.name });
      }
    }
    return fbPages;
  }, [service]);

  const onSetAccountId = (accountId) => {
    setAccountId(accountId);
  }

  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }  

  // Save all Settings
  const onSave = () => {
    const newSettings = { serviceId, accountId, color, period, chart };
    props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  // Set default name
  useEffect(() => {
    if (!name && accountId) {
      const profile = fbPages.find(x => x.accountId === accountId);
      setName(profile.name);
    }
  }, [ accountId ]);

  return (
    <>

      <h5>Page Likes - Growth</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='facebook' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)} 
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={accountId} onChange={(ev) => onSetAccountId(ev.target.value)}>
              {fbPages.map((x) => <MenuItem key={x.accountId} value={x.accountId}>{x.name}</MenuItem>)}
            </Select>
            <FormHelperText>Select the FB page.</FormHelperText>
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
        <NekoButton quarternary  onClick={() => onReset()} >Reset</NekoButton>
        <div style={{ width: '100%' }}></div>
        <NekoButton quarternary onClick={props.onClose} >Close</NekoButton>
        <NekoButton tertiary onClick={() => onSave()} >Save</NekoButton>
      </DialogActions>

    </>
  );
}

PageLikesSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default PageLikesSettings;

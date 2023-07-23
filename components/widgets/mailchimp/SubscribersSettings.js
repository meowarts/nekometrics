import { useState, useMemo, useEffect } from 'react';
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

function SuscribersSettings(props) {
  
  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [listId, setListId] = useState(settings.listId ? settings.listId : '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });
  
  // System
  const css = useStyles();
  const { services } = useGlobalState(); 
  const service = services.find(x => x._id === serviceId);
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  // Save all Settings
  const onSave = () => {
    const newSettings = { serviceId, listId, color, period, chart };
    props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  // Get lists
  const lists = useMemo(() => {
    if (service && service.data && service.data.lists)
      return service.data.lists;
    return [];
  }, [service]);

  // Set default name
  useEffect(() => {
    if (!name && listId) {
      const list = lists.find(x => x.id === listId);
      if (list) {
        setName(list.name);
      }
    }
  }, [ lists, listId, name ]);
  
  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Mailchimp - Historical</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='mailchimp' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)} 
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={listId} onChange={(ev) => setListId(ev.target.value)}>
              {lists.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
            </Select>
            <FormHelperText>Select the Mailchimp list.</FormHelperText>
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

SuscribersSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func
};

export default SuscribersSettings;

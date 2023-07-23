import { useState, useEffect } from 'react';
import { makeStyles,TextField, DialogContent, DialogActions } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

import useGlobalState from '~/libs/context';
import ServiceAccordion from '../common/panels/ServiceExpansionPanel';
import PeriodAccordion from '../common/panels/PeriodExpansionPanel';
import ColorAccordion from '../common/panels/ColorExpansionPanel';
import AdminAccordion from '../common/panels/AdminExpansionPanel';
import ChartExpansionPanel from '../common/panels/ChartExpansionPanel';

import { NekoWidgetSettingsStyles } from '~/theme';
import NekoButton from '~/components/buttons/NekoButton';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

function SalesSettings(props) {

  // Widget
  const { widget, onUpdateWidget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });

  // System
  const css = useStyles();
  const { services } = useGlobalState(); 
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) }

  // Save all Settings
  const onSave = async () => {
    const newSettings = { serviceId, color, period, chart };
    await onUpdateWidget(name, newSettings);
    props.onClose();
  }

  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }
  
  // Set default name
  useEffect(() => {
    if (!name && serviceId) {
      // console.log(widget, settings);
      setName('WooCommerce');
    }
  }, [ serviceId ]);

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>EDD - Historical</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='woocommerce' services={services}
          onExpandPanel={(_ev, open) => expandPanel(open ? 'servicePanel' : false)} 
          serviceId={serviceId} onSetServiceId={setServiceId} />

        <ColorAccordion expanded={expanded === 'colorPanel'} 
          title='Sales'
          onExpandPanel={(_ev, open) => expandPanel(open ? 'colorPanel' : false)} 
          color={color} onSetColor={setColor} />

        <PeriodAccordion expanded={expanded === 'periodPanel'} 
          onExpandPanel={(_ev, open) => expandPanel(open ? 'periodPanel' : false)} 
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

SalesSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default SalesSettings;

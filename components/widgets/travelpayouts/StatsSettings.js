import { useState } from 'react';
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

const CHOICES = [
  { id: 'clicks', name: 'Clicks' },
  { id: 'bookings', name: 'Bookings' },
  { id: 'earnings', name: 'Earnings, confirmed' },
  { id: 'potential', name: 'Earnings, still processing' }
];

function StatsSettings(props) {

  const { widget } = props;
  const { settings } = widget;

  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [metric, setMetric] = useState(settings.metric ? settings.metric : 'clicks');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'month', length: 3 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'bar' });

  const css = useStyles();
  const { services } = useGlobalState();
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  const onSave = async () => {
    await props.onUpdateWidget(name, { serviceId, metric, color, period, chart });
    props.onClose();
  }

  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Travelpayouts - Statistics</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name}
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='travelpayouts' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)}
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={metric} onChange={(ev) => setMetric(ev.target.value)}>
              {CHOICES.map(x => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
            </Select>
            <FormHelperText>What to follow.</FormHelperText>
          </FormControl>
        </ServiceAccordion>

        <ColorAccordion expanded={expanded === 'colorPanel'}
          title={(CHOICES.find(x => x.id === metric) || CHOICES[0]).name}
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
        <NekoButton tertiary onClick={() => onReset()} >Reset</NekoButton>
        <div style={{ width: '100%' }}></div>
        <NekoButton quarternary onClick={props.onClose} >Close</NekoButton>
        <NekoButton tertiary onClick={() => onSave()} >Save</NekoButton>
      </DialogActions>
    </>
  );
}

StatsSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default StatsSettings;

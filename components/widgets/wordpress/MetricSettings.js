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

function MetricSettings(props) {

  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [provider, setProvider] = useState(settings.provider ? settings.provider : '');
  const [metric, setMetric] = useState(settings.metric ? settings.metric : '');
  const [params, setParams] = useState(settings.params ? settings.params : {});
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });

  // System
  const css = useStyles();
  const { services } = useGlobalState();
  const service = services.find(x => x._id === serviceId);
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  // The site tells us what it can share, so a new provider added to the plugin
  // shows up here without anything to change on this side.
  const sources = useMemo(() => {
    const all = service?.data?.sources || [];
    return all.filter(x => x.available);
  }, [service]);

  const currentSource = useMemo(() => sources.find(x => x.id === provider), [sources, provider]);
  const metrics = currentSource ? currentSource.metrics : [];
  const currentMetric = useMemo(() => metrics.find(x => x.id === metric), [metrics, metric]);

  const onSetProvider = (value) => {
    setProvider(value);
    setMetric('');
    setParams({});
  }

  const onSetMetric = (value) => {
    setMetric(value);
    const definition = metrics.find(x => x.id === value);
    const defaults = {};
    (definition?.params || []).forEach(x => { defaults[x.id] = x.default });
    setParams(defaults);
  }

  const onSetParam = (id, value) => {
    setParams({ ...params, [id]: value });
  }

  // Save all Settings
  const onSave = async () => {
    const newSettings = { serviceId, provider, metric, params, color, period, chart };
    await props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  // Changing the metric changes which series the widget reads, so the old one
  // has to be thrown away rather than left to mix with the new one.
  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }

  // Set default name
  useEffect(() => {
    if (!name && currentMetric) {
      setName(currentMetric.name);
    }
  }, [ currentMetric, name ]);

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>WordPress - Historical</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name}
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='wordpress' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)}
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={provider} onChange={(ev) => onSetProvider(ev.target.value)}>
              {sources.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
            </Select>
            <FormHelperText>Select the source on your site.</FormHelperText>
          </FormControl>

          {!!metrics.length && <FormControl>
            <Select value={metric} onChange={(ev) => onSetMetric(ev.target.value)}>
              {metrics.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
            </Select>
            <FormHelperText>Select the metric.</FormHelperText>
          </FormControl>}

          {(currentMetric?.params || []).map((definition) => (
            <FormControl key={definition.id}>
              <Select value={params[definition.id] || ''}
                onChange={(ev) => onSetParam(definition.id, ev.target.value)}>
                {definition.options.map((option) =>
                  <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                )}
              </Select>
              <FormHelperText>{definition.name}</FormHelperText>
            </FormControl>
          ))}

          {!!currentMetric?.note && <FormHelperText style={{ marginTop: 10 }}>
            {currentMetric.note}
          </FormHelperText>}
        </ServiceAccordion>

        <ColorAccordion expanded={expanded === 'colorPanel'}
          title={currentMetric ? currentMetric.name : 'Value'}
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

MetricSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default MetricSettings;

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

function TrafficSettings(props) {

  const { widget } = props;
  const { settings } = widget;

  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [site, setSite] = useState(settings.site ? settings.site : '');
  const [metric, setMetric] = useState(settings.metric ? settings.metric : 'visitors');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'month', length: 3 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });

  const css = useStyles();
  const own = ownStyles();
  const { services } = useGlobalState();
  const service = services.find(x => x._id === serviceId);
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  const sites = useMemo(() => service?.data?.sites || [], [service]);

  const onSave = async () => {
    await props.onUpdateWidget(name, { serviceId, site, metric, color, period, chart });
    props.onClose();
  }

  // Changing the site or the metric points the widget at another series, so the
  // one it holds is no longer about the same thing.
  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }

  useEffect(() => {
    if (!name && site) {
      setName(site);
    }
  }, [ site, name ]);

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Plausible - Traffic</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name}
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='plausible' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)}
          serviceId={serviceId} onSetServiceId={setServiceId}>
          {/* Stacked: two selects side by side in the panel's flex row would
              squeeze both labels down to a few letters. */}
          <div className={own.column}>
            <FormControl fullWidth className={own.field}>
              <Select value={site} onChange={(ev) => setSite(ev.target.value)}>
                {sites.map((x) => <MenuItem key={x.domain} value={x.domain}>{x.domain}</MenuItem>)}
              </Select>
              <FormHelperText>The site to follow.</FormHelperText>
            </FormControl>
            <FormControl fullWidth>
              <Select value={metric} onChange={(ev) => setMetric(ev.target.value)}>
                <MenuItem value='visitors'>Visitors</MenuItem>
                <MenuItem value='pageviews'>Pageviews</MenuItem>
              </Select>
              <FormHelperText>What to count.</FormHelperText>
            </FormControl>
          </div>
        </ServiceAccordion>

        <ColorAccordion expanded={expanded === 'colorPanel'}
          title={metric === 'pageviews' ? 'Pageviews' : 'Visitors'}
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

const ownStyles = makeStyles(() => ({
  column: { display: 'flex', flexDirection: 'column', flex: 1 },
  field: { marginBottom: 15 }
}));

TrafficSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default TrafficSettings;

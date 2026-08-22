import { makeStyles } from "@material-ui/core";
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

/**
 * The site describes its own metrics, so this panel is built from whatever it
 * sent: a source, a metric, and however many parameters that metric declares.
 * They are stacked rather than laid out in a row, because the number of them is
 * not known in advance and a row of four dropdowns crushes every label.
 */
const MetricAccordion = (props) => {

  // Props
  const { expanded, onExpandPanel, sources, provider, metric, params,
    onSetProvider, onSetMetric, onSetParam } = props;

  // System
  const css = useStyles();
  const own = ownStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  const source = sources.find(x => x.id === provider);
  const metrics = source ? source.metrics : [];
  const current = metrics.find(x => x.id === metric);
  const summary = current ? `${source.name} - ${current.name}` : 'N/A';

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Metric</Typography>
        <Typography className={css.secondaryHeading}>{summary}</Typography>
      </AccordionSummary>
      <AccordionDetails className={own.details}>

        <FormControl fullWidth className={own.field}>
          <Select value={provider} onChange={(ev) => onSetProvider(ev.target.value)}>
            {sources.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
          </Select>
          <FormHelperText>What on your site the numbers come from.</FormHelperText>
        </FormControl>

        {!!metrics.length && <FormControl fullWidth className={own.field}>
          <Select value={metric} onChange={(ev) => onSetMetric(ev.target.value)}>
            {metrics.map((x) => <MenuItem key={x.id} value={x.id}>{x.name}</MenuItem>)}
          </Select>
          <FormHelperText>The metric to follow.</FormHelperText>
        </FormControl>}

        {(current ? current.params : []).map((definition) => (
          <FormControl fullWidth className={own.field} key={definition.id}>
            <Select value={params[definition.id] || ''}
              onChange={(ev) => onSetParam(definition.id, ev.target.value)}>
              {definition.options.map((option) =>
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              )}
            </Select>
            <FormHelperText>{definition.name}</FormHelperText>
          </FormControl>
        ))}

        {!!(current && current.note) && <Typography className={own.note}>{current.note}</Typography>}

      </AccordionDetails>
    </Accordion>
  );
};

const ownStyles = makeStyles(theme => ({
  details: {
    flexDirection: 'column'
  },
  field: {
    marginBottom: 15
  },
  note: {
    fontSize: theme.typography.pxToRem(12),
    lineHeight: 1.6,
    color: theme.palette.text.secondary
  }
}));

MetricAccordion.propTypes = {
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  sources: PropTypes.array,
  provider: PropTypes.string,
  metric: PropTypes.string,
  params: PropTypes.object,
  onSetProvider: PropTypes.func,
  onSetMetric: PropTypes.func,
  onSetParam: PropTypes.func
};

export default MetricAccordion;

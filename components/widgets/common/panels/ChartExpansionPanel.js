import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography, Select, MenuItem, FormControl } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

const types = [
  { name: 'area', title: 'Area Chart' },
  { name: 'line', title: 'Line Chart' },
  { name: 'bar', title: 'Bar Chart' }
];

const ChartExpansionPanel = (props) => {

  // Props
  const { expanded, onExpandPanel, chart, onSetChart } = props;
  const currentChartType = types.find(x => x.name === (chart?.type ? chart.type : 'area'));

  // System
  const css = useStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  const onUpdateChartSettings = (newSettings) => {
    onSetChart({ ...chart, ...newSettings });
  }

  const onUpdateType = (ev) => {
    const name = ev.target.value;
    onUpdateChartSettings({ type: name });
  }

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Chart</Typography>
        <Typography className={css.secondaryHeading}>{currentChartType.title}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl>
          <Select value={currentChartType.name} onChange={onUpdateType}>
            {types.map(x => (<MenuItem key={`chart-type-${x.name}`} value={x.name}>{x.title}</MenuItem>))}
          </Select>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );

};

ChartExpansionPanel.propTypes = {
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  chart: PropTypes.object,
  onSetChart: PropTypes.func
};

export default ChartExpansionPanel;

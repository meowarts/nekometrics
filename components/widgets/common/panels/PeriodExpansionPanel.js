import { makeStyles } from "@material-ui/core";
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography, Select, MenuItem, FormControl } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

const PeriodAccordion = (props) => {

  // Props
  const { expanded, onExpandPanel, period, onSetPeriod } = props;
  const setPeriod = (period) => { onSetPeriod(period) }

  // System
  const css = useStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Range</Typography>
        <Typography className={css.secondaryHeading}>{period.length} {period.unit}{period.length > 1 ? 's' : ''}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl>
          <Select value={period.length} onChange={(ev) => setPeriod({ ...period, length: ev.target.value })}>
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
            <MenuItem value={6}>6</MenuItem>
          </Select>
        </FormControl>
        <FormControl>
          <Select value={period.unit} onChange={(ev) => setPeriod({ ...period, unit: ev.target.value })}>
            <MenuItem value='day'>day{period.length > 1 ? 's' : ''}</MenuItem>
            <MenuItem value='week'>week{period.length > 1 ? 's' : ''}</MenuItem>
            <MenuItem value='month'>month{period.length > 1 ? 's' : ''}</MenuItem>
            <MenuItem value='year'>year{period.length > 1 ? 's' : ''}</MenuItem>
          </Select>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );

};

PeriodAccordion.propTypes = {
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  period: PropTypes.object,
  onSetPeriod: PropTypes.func
};

export default PeriodAccordion;

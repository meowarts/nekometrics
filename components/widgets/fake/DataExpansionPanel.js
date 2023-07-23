import { makeStyles } from '@material-ui/core';
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography, Select, MenuItem, FormControl } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

const DataExpansionPanel = (props) => {

  // Props
  const { expanded, onExpandPanel, dataType, onSetDataType } = props;

  // System
  const css = useStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Data Type</Typography>
        <Typography className={css.secondaryHeading}>{dataType === 'cumulative' ? 'Cumulative' : 'Standard'}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl>
          <Select value={dataType ? dataType : 'normal'} onChange={(ev) => onSetDataType(ev.target.value)}>
            <MenuItem value={'normal'}>Standard</MenuItem>
            <MenuItem value={'cumulative'}>Cumulative</MenuItem>
          </Select>
        </FormControl>
      </AccordionDetails>
    </Accordion>
  );

};

DataExpansionPanel.propTypes = {
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  dataType: PropTypes.object,
  onSetDataType: PropTypes.func
};

export default DataExpansionPanel;

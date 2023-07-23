import { useState } from 'react';
import { makeStyles, DialogContent, DialogActions } from "@material-ui/core";
import { TextField } from '@material-ui/core/';
import PropTypes from 'prop-types';
import CloseIcon from '@material-ui/icons/Close';

import PeriodAccordion from '../common/panels/PeriodExpansionPanel';
import ColorAccordion from '../common/panels/ColorExpansionPanel';
import NekoButton from '~/components/buttons/NekoButton';

import { NekoWidgetSettingsStyles } from '~/theme';
import DataExpansionPanel from './DataExpansionPanel';
import ChartExpansionPanel from '../common/panels/ChartExpansionPanel';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

function FakeHistoricalSettings(props) {
  
  // Widget
  const { widget } = props;
  const { settings } = widget;

  // Settings
  const [name, setName] = useState(widget.name ? widget.name : '');
  const [color, setColor] = useState(settings.color ? settings.color : '');
  const [dataType, setDataType] = useState(settings.dataType ? settings.dataType : 'growth');
  const [period, setPeriod] = useState(settings.period ? settings.period : { unit: 'week', length: 2 });
  const [chart, setChart] = useState(settings.chart ? settings.chart : { type: 'area' });
  
  // System
  const css = useStyles();
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  // Save all Settings
  const onSave = () => {
    const newSettings = { color, period, dataType, chart };
    props.onUpdateWidget(name, newSettings);
    props.onClose();
  }

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>Fake - Historical</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name} 
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ColorAccordion expanded={expanded === 'colorPanel'} 
          title='Followers'
          onExpandPanel={(ev, open) => expandPanel(open ? 'colorPanel' : false)} 
          color={color} onSetColor={setColor} />

        <PeriodAccordion expanded={expanded === 'periodPanel'} 
          onExpandPanel={(ev, open) => expandPanel(open ? 'periodPanel' : false)} 
          period={period} onSetPeriod={setPeriod} />

        <DataExpansionPanel expanded={expanded === 'dataTypePanel'} 
          onExpandPanel={(ev, open) => expandPanel(open ? 'dataTypePanel' : false)} 
          dataType={dataType} onSetDataType={setDataType} />

        <ChartExpansionPanel expanded={expanded === 'chartPanel'} 
          onExpandPanel={(ev, open) => expandPanel(open ? 'chartPanel' : false)} 
          chart={chart} onSetChart={setChart} />

      </DialogContent>

      <DialogActions style={{ margin: '5px 15px 10px 10px' }}>
        <NekoButton quarternary onClick={props.onClose} >Close</NekoButton>
        <NekoButton tertiary onClick={() => onSave()} >Save</NekoButton>
      </DialogActions>

    </>
  );
}

FakeHistoricalSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func
};

export default FakeHistoricalSettings;

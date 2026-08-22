import { useState } from 'react';
import { makeStyles, DialogContent, DialogActions } from "@material-ui/core";
import { TextField, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
import CloseIcon from '@material-ui/icons/Close';
import PropTypes from 'prop-types';

import ServiceAccordion from '../common/panels/ServiceExpansionPanel';
import AdminAccordion from '../common/panels/AdminExpansionPanel';

import useGlobalState from '~/libs/context';
import { NekoWidgetSettingsStyles } from '~/theme';
import NekoButton from '~/components/buttons/NekoButton';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

function PortfolioSettings(props) {

  const { widget } = props;
  const { settings } = widget;

  const [name, setName] = useState(widget.name ? widget.name : '');
  const [serviceId, setServiceId] = useState(settings.serviceId ? settings.serviceId : '');
  const [by, setBy] = useState(settings.by ? settings.by : 'installs');

  const css = useStyles();
  const { services } = useGlobalState();
  const [expanded, setExpanded] = useState(false);
  const expandPanel = (panel) => { setExpanded(panel) };

  const onSave = async () => {
    await props.onUpdateWidget(name, { serviceId, by });
    props.onClose();
  }

  const onReset = async () => {
    await props.onResetWidget();
    props.onClose();
  }

  return (
    <>
      <CloseIcon style={{ position: 'absolute', right: 20, top: 15, cursor: 'pointer'}} onClick={() => props.onClose()}/>
      <h5>WordPress.org - All Plugins</h5>

      <DialogContent>
        <TextField className={css.titleTextField} autoFocus id="Title" label="Title" type="text" value={name}
          onChange={ev => setName(ev.target.value)} fullWidth />

        <ServiceAccordion expanded={expanded === 'servicePanel'}
          serviceName='wordpressorg' services={services}
          onExpandPanel={(ev, open) => expandPanel(open ? 'servicePanel' : false)}
          serviceId={serviceId} onSetServiceId={setServiceId}>
          <FormControl>
            <Select value={by} onChange={(ev) => setBy(ev.target.value)}>
              <MenuItem value='installs'>Active installs</MenuItem>
              <MenuItem value='downloads'>Downloads, all time</MenuItem>
            </Select>
            <FormHelperText>What the slices measure.</FormHelperText>
          </FormControl>
        </ServiceAccordion>

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

PortfolioSettings.propTypes = {
	widget: PropTypes.object,
  onClose: PropTypes.func,
  onUpdateWidget: PropTypes.func,
  onResetWidget: PropTypes.func
};

export default PortfolioSettings;

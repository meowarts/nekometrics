import { makeStyles } from "@material-ui/core";
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography, Select, MenuItem, FormControl, FormHelperText } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';
const useStyles = makeStyles(NekoWidgetSettingsStyles);

const ServiceAccordion = (props) => {

  // Props
  const { serviceName, services, expanded, onExpandPanel, serviceId, onSetServiceId } = props;

  // System
  const css = useStyles();
  const service = services.find(x => x._id === serviceId);
  const setServiceId = (service) => { onSetServiceId(service) };
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>Source</Typography>
        <Typography className={css.secondaryHeading}>{service ? service.name : 'N/A'}</Typography>
      </AccordionSummary>
      <AccordionDetails>
        <FormControl>
          <Select value={serviceId} onChange={(ev) => setServiceId(ev.target.value)}>
            {services.filter(x => x.service === serviceName).map((x) => 
              <MenuItem key={x._id} value={x._id}>{x.name}</MenuItem>
            )}
          </Select>
          <FormHelperText>Select the service.</FormHelperText>
        </FormControl>
        {props.children}
      </AccordionDetails>
    </Accordion>
  );

};

ServiceAccordion.propTypes = {
  serviceName: PropTypes.string,
  services: PropTypes.array,
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  serviceId: PropTypes.string,
  onSetServiceId: PropTypes.func,
  children: PropTypes.object
};

export default ServiceAccordion;

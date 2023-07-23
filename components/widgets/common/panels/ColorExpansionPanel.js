import { makeStyles, Avatar, useTheme } from "@material-ui/core";
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { NekoWidgetSettingsStyles } from '~/theme';

const useStyles = makeStyles(NekoWidgetSettingsStyles);

const ColorPicker = ({ onSetColor }) => {
  const setColor = (color) => { onSetColor(color) }
  const css = colorPickerStyles();
  const theme = useTheme()

  return (
    <ul className={css.colorPickerWrapper}>
      {theme.gradientRepo.map((option) => (
        <a key={`gradient-select-${option.name}`} style={{ cursor: 'pointer' }} 
          onClick={() => setColor(option.color)} >
          <div className={css.circle} style={{ background: option.color }}/>
        </a>))
      }
    </ul>
  )
}

const ColorAccordion = (props) => {

  // Props
  const { title, expanded, onExpandPanel, color, onSetColor } = props;

  // System
  const css = useStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>{title}</Typography>
        <div className={css.secondaryHeading}>
          <Avatar style={{ backgroundColor: color, width: 24, height: 24 }}> </Avatar>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <ColorPicker onSetColor={onSetColor}/>
      </AccordionDetails>
    </Accordion>
  );

};

const colorPickerStyles = makeStyles(() => ({
  colorPickerWrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    padding: 0,
    margin: 0
  },
  circle: {
    height: '25px',
    width: '25px',
    borderRadius: '50%',
    marginRight: '10px',
    marginBottom: '5px',
    '&:hover': {
      border: '1px solid #E2E2E2'
    }
  }
}));


ColorAccordion.propTypes = {
	title: PropTypes.string,
  expanded: PropTypes.bool,
  onExpandPanel: PropTypes.func,
  color: PropTypes.string,
  onSetColor: PropTypes.func
};

export default ColorAccordion;
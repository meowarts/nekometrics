import { makeStyles, Avatar, useTheme } from "@material-ui/core";
import PropTypes from 'prop-types';

import { Accordion, AccordionDetails, AccordionSummary } from '@material-ui/core/';
import { Typography } from '@material-ui/core/';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import BlockIcon from '@material-ui/icons/Block';

import { NekoWidgetSettingsStyles } from '~/theme';
import { WIDGET_ICONS, getIconByName } from '../icons';

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

/**
 * The icon is optional: a widget that never sets one keeps the one that comes
 * with its service, which is the right default and what most cards should stay
 * on. Picking is for the handful you want to tell apart at a glance.
 */
const IconPicker = ({ icon, onSetIcon }) => {
  const css = iconPickerStyles();
  return (
    <div className={css.wrapper}>
      <div className={css.row}>
        <a className={`${css.icon} ${!icon ? css.selected : ''}`} onClick={() => onSetIcon('')}>
          <BlockIcon fontSize="small" />
        </a>
        <span className={css.groupName}>Service default</span>
      </div>
      {WIDGET_ICONS.map(group => (
        <div key={group.group}>
          <span className={css.groupName}>{group.group}</span>
          <div className={css.row}>
            {Object.keys(group.items).map(name => {
              const Icon = group.items[name];
              return (
                <a key={name} title={name} onClick={() => onSetIcon(name)}
                  className={`${css.icon} ${icon === name ? css.selected : ''}`}>
                  <Icon fontSize="small" />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

const ColorAccordion = (props) => {

  // Props
  const { title, expanded, onExpandPanel, color, onSetColor, icon, onSetIcon } = props;
  const CurrentIcon = getIconByName(icon);

  // System
  const css = useStyles();
  const handleChange = () => (ev, open) => { onExpandPanel(ev, open) };

  return (
    <Accordion expanded={expanded} onChange={handleChange()}>
      <AccordionSummary classes={{ content: css.summary }} expandIcon={<ExpandMoreIcon />}>
        <Typography className={css.heading}>{title}</Typography>
        <div className={css.secondaryHeading} style={{ display: 'flex', alignItems: 'center' }}>
          <Avatar style={{ backgroundColor: color, width: 24, height: 24 }}> </Avatar>
          {!!CurrentIcon && <CurrentIcon fontSize="small" style={{ marginLeft: 8 }} />}
        </div>
      </AccordionSummary>
      <AccordionDetails style={{ flexDirection: 'column' }}>
        <ColorPicker onSetColor={onSetColor}/>
        {!!onSetIcon && <IconPicker icon={icon} onSetIcon={onSetIcon} />}
      </AccordionDetails>
    </Accordion>
  );

};

const iconPickerStyles = makeStyles(theme => ({
  wrapper: { marginTop: 5, maxHeight: 210, overflowY: 'auto', width: '100%' },
  groupName: {
    fontSize: theme.typography.pxToRem(11),
    color: theme.palette.text.secondary,
    display: 'block',
    marginTop: 6
  },
  row: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px' },
  icon: {
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    lineHeight: 0,
    border: '1px solid transparent',
    '&:hover': { background: 'rgba(127, 127, 127, 0.15)' }
  },
  selected: { border: '1px solid #AB7BFF', background: 'rgba(171, 123, 255, 0.15)' }
}));

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
  onSetColor: PropTypes.func,
  icon: PropTypes.string,
  onSetIcon: PropTypes.func
};

export default ColorAccordion;